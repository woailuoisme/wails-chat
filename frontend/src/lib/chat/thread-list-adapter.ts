import type { RemoteThreadListAdapter, ThreadMessage } from "@assistant-ui/core";
import type { AssistantStream } from "assistant-stream";

import i18n from "@/i18n";

import { getThread, listThreads, patchThread, removeThread, upsertThread } from "./thread-store";

/** 首条用户消息的前 30 字做标题 */
function titleFromMessages(messages: readonly ThreadMessage[]): string {
  for (const message of messages) {
    if (message.role !== "user") continue;
    const text = message.content
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ")
      .trim();
    if (text) return text.slice(0, 30);
  }
  return i18n.t("chat.newThreadTitle");
}

/**
 * 会话元数据的本地实现。
 *
 * 标题同步写入存储，`generateTitle` 返回一个立即结束的空流：
 * 构造 AssistantStream 需要协议 chunk，这里不需要向 UI 回放标题文本。
 * shortcut: 标题不做流式回放，需要时改用 DataStreamEncoder 写 chunk。
 */
export const threadListAdapter: RemoteThreadListAdapter = {
  async list() {
    const threads = listThreads()
      .filter((thread) => thread.status === "regular")
      .toSorted((a, b) => b.lastMessageAt - a.lastMessageAt)
      .map((thread) => ({
        status: thread.status,
        remoteId: thread.remoteId,
        title: thread.title,
        lastMessageAt: new Date(thread.lastMessageAt),
      }));

    return { threads };
  },

  async initialize(threadId) {
    const existing = getThread(threadId);
    if (!existing) {
      const now = Date.now();
      upsertThread({
        remoteId: threadId,
        status: "regular",
        createdAt: now,
        lastMessageAt: now,
      });
    }
    return { remoteId: threadId };
  },

  async fetch(threadId) {
    const thread = getThread(threadId);
    if (!thread) throw new Error(i18n.t("errors.threadNotFound", { id: threadId }));
    return {
      status: thread.status,
      remoteId: thread.remoteId,
      title: thread.title,
      lastMessageAt: new Date(thread.lastMessageAt),
    };
  },

  async rename(remoteId, newTitle) {
    patchThread(remoteId, { title: newTitle });
  },

  async archive(remoteId) {
    patchThread(remoteId, { status: "archived" });
  },

  async unarchive(remoteId) {
    patchThread(remoteId, { status: "regular" });
  },

  async delete(remoteId) {
    removeThread(remoteId);
  },

  async generateTitle(remoteId, messages) {
    patchThread(remoteId, { title: titleFromMessages(messages) });
    return new ReadableStream() as AssistantStream;
  },
};
