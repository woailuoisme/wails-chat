import { useChatRuntime } from "@assistant-ui/ai-sdk";
import {
  AssistantRuntimeProvider,
  WebSpeechDictationAdapter,
  useAui,
  useAuiState,
  useRemoteThreadListRuntime,
} from "@assistant-ui/react";
import { DevToolsModal } from "@assistant-ui/react-devtools";
import * as React from "react";

import i18n, { speechLocale } from "@/i18n";
import { LocalChatTransport } from "@/lib/ai/chat-transport";
import { extractArtifact } from "@/lib/chat/artifact-extraction";
import { readDraft, writeDraft } from "@/lib/chat/composer-drafts";
import { createThreadHistoryAdapter } from "@/lib/chat/thread-history-adapter";
import { threadListAdapter } from "@/lib/chat/thread-list-adapter";
import { useArtifactsStore } from "@/lib/store/artifacts-store";
import { useChatStore } from "@/lib/store/chat-store";
import { useSettingsStore } from "@/lib/store/settings-store";

import { attachmentAdapter } from "./input/attachment-adapter";

/** 每个线程一份：历史读写 */
function useThreadAdapters() {
  const aui = useAui();
  const history = React.useMemo(() => createThreadHistoryAdapter(aui), [aui]);
  return React.useMemo(() => ({ history }), [history]);
}

/** 每个线程一份：传输 + 附件 + 语音 */
function useThreadRuntime(language: string) {
  const dictationAdapter = React.useMemo(
    () => new WebSpeechDictationAdapter({ language: speechLocale(language) }),
    [language],
  );
  const transport = React.useMemo(() => new LocalChatTransport(), []);

  return useChatRuntime({
    transport,
    throttle: 50,
    adapters: { attachments: attachmentAdapter, dictation: dictationAdapter },
    onError: () => {
      // 缺 key、网络失败等发生在流建立之前，只有 onError 能捕获
      useChatStore.getState().setRunError(i18n.t("errors.generationFailed"));
    },
    onFinish: ({ message }) => {
      const text = message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n");
      const artifact = extractArtifact(text, message.id);
      if (artifact) useArtifactsStore.getState().openArtifact(artifact);
    },
  });
}

/**
 * AI SDK + 本地持久化的 runtime 装配。
 *
 * 会话列表、切换、历史都由 `useRemoteThreadListRuntime` 管理，
 * 元数据落在 `thread-store`，消息由 history adapter 按线程读写。
 */
export function ChatRuntimeProvider({ children }: { children: React.ReactNode }) {
  const language = useSettingsStore((state) => state.language);

  // 库约定：这两个字段本身就是 per-thread hook 槽位
  const adapter = React.useMemo(
    () => ({
      ...threadListAdapter,
      // oxlint-disable-next-line react-hooks/rules-of-hooks
      unstable_useAdapters: useThreadAdapters,
    }),
    [],
  );

  const runtime = useRemoteThreadListRuntime({
    adapter,
    // oxlint-disable-next-line react-hooks/rules-of-hooks
    runtimeHook: () => useThreadRuntime(language),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ComposerDraftSync />
      <RunStateSync />
      <DevToolsModal />
      {children}
    </AssistantRuntimeProvider>
  );
}

/** 草稿按线程保存：runtime 不持久化输入框内容 */
function ComposerDraftSync() {
  const aui = useAui();
  const threadId = useAuiState((s) => s.threadListItem.id);
  const text = useAuiState((s) => s.composer.text);

  React.useEffect(() => {
    const draft = readDraft(threadId ?? null);
    if (draft) aui.composer.setText(draft);
  }, [aui, threadId]);

  React.useEffect(() => {
    writeDraft(threadId ?? null, text);
  }, [text, threadId]);

  return null;
}

/** 换线程时清掉上一轮的全局错误；一轮结束后刷新列表（标题/排序由 adapter 写入） */
function RunStateSync() {
  const aui = useAui();
  const threadId = useAuiState((s) => s.threadListItem.id);
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const wasRunning = React.useRef(isRunning);

  // 换线程必须清掉上一轮的全局错误提示
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    useChatStore.getState().setRunError(null);
  }, [threadId]);

  React.useEffect(() => {
    if (wasRunning.current && !isRunning) void aui.threads.reload();
    wasRunning.current = isRunning;
  }, [aui, isRunning]);

  return null;
}
