import type {
  GenericThreadHistoryAdapter,
  MessageFormatAdapter,
  MessageStorageEntry,
  ThreadHistoryAdapter,
} from "@assistant-ui/core";
import type { AssistantClient } from "@assistant-ui/store";

import { toUIMessages } from "@/lib/ai/chat-transport";

import { readLegacyMessages } from "./migrate-legacy-chat";
import { readMessages, writeMessages } from "./thread-store";

type StoredEntry = MessageStorageEntry<Record<string, unknown>>;

/** 每个已挂载线程都会调一次，remoteId 必须在使用时再取 */
function currentRemoteId(aui: AssistantClient): string | undefined {
  const item = aui.threadListItem().getState();
  // 新建线程首次 append 时 remoteId 尚未落定，initialize 用的本地 id 是同一个键
  return item.remoteId ?? item.id;
}

/**
 * 把消息读写接到 localStorage。
 *
 * 真正的序列化由 runtime 传入的 `formatAdapter` 决定（AI SDK 消息格式），
 * 这里只负责按 remoteId 落盘、按 format 区分条目。
 */
function createGenericHistory<TMessage, TStorageFormat extends Record<string, unknown>>(
  aui: AssistantClient,
  format: MessageFormatAdapter<TMessage, TStorageFormat>,
): GenericThreadHistoryAdapter<TMessage> {
  const entriesOf = (remoteId: string): StoredEntry[] =>
    readMessages(remoteId).filter((entry) => entry.format === format.format);

  // 存储层只认 JSON，具体形状由 formatAdapter 决定
  const asStored = (entry: StoredEntry) => entry as unknown as MessageStorageEntry<TStorageFormat>;

  const replaceEntry = (remoteId: string, entry: StoredEntry): void => {
    const others = readMessages(remoteId).filter((item) => item.format !== format.format);
    const current = entriesOf(remoteId).filter((item) => item.id !== entry.id);
    writeMessages(remoteId, [...others, ...current, entry]);
  };

  const encodeEntry = (item: { parentId: string | null; message: TMessage }): StoredEntry => ({
    id: format.getId(item.message),
    parent_id: item.parentId,
    format: format.format,
    content: format.encode(item) as Record<string, unknown>,
  });

  return {
    async load() {
      const remoteId = currentRemoteId(aui);
      if (!remoteId) return { messages: [] };

      const entries = entriesOf(remoteId);
      if (entries.length > 0) {
        return { messages: entries.map((entry) => format.decode(asStored(entry))) };
      }

      // 旧会话第一次打开：把 zustand 里的历史读出来，下次 append 起走新格式
      const legacy = readLegacyMessages(remoteId);
      if (legacy) {
        return {
          messages: toUIMessages(legacy).map((message) => ({
            parentId: null,
            message: message as unknown as TMessage,
          })),
        };
      }

      return { messages: [] };
    },

    async append(item) {
      const remoteId = currentRemoteId(aui);
      if (!remoteId) return;
      replaceEntry(remoteId, encodeEntry(item));
    },

    async update(item) {
      const remoteId = currentRemoteId(aui);
      if (!remoteId) return;
      replaceEntry(remoteId, encodeEntry(item));
    },

    async delete(items) {
      const remoteId = currentRemoteId(aui);
      if (!remoteId) return;
      const doomed = new Set(items.map((item) => format.getId(item.message)));
      const kept = readMessages(remoteId).filter(
        (entry) => entry.format !== format.format || !doomed.has(entry.id),
      );
      writeMessages(remoteId, kept);
    },
  };
}

export function createThreadHistoryAdapter(aui: AssistantClient): ThreadHistoryAdapter {
  return {
    // useChatRuntime 只走 withFormat 分支，这两个是接口占位
    async load() {
      return { messages: [] };
    },
    async append() {},
    withFormat<TMessage, TStorageFormat extends Record<string, unknown>>(
      format: MessageFormatAdapter<TMessage, TStorageFormat>,
    ) {
      return createGenericHistory(aui, format);
    },
  };
}
