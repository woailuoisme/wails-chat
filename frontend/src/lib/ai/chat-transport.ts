import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";

import i18n from "@/i18n";
import { useChatStore } from "@/lib/store/chat-store";
import { useSettingsStore } from "@/lib/store/settings-store";

import { executeStreamChat } from "./providers";
import type { ChatAttachment, ChatMessage, WebSource } from "./types";

/** 我们在 UIMessage.metadata.custom 里携带的附加信息 */
interface ChatCustomMetadata {
  sources?: WebSource[];
  thinkingDuration?: number;
  chatAttachments?: ChatAttachment[];
  /** 保留原始创建时间，镜像回写时不会被刷成“现在” */
  createdAt?: number;
}

function readCustom(message: { metadata?: unknown }): ChatCustomMetadata {
  return ((message.metadata as { custom?: ChatCustomMetadata } | undefined)?.custom ??
    {}) as ChatCustomMetadata;
}

function textOf(message: { parts: readonly { type: string; text?: string }[] }): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("\n");
}

/** 附件跟着 message parts 走；metadata 里的副本只作为旧数据兼容 */
function attachmentsOf(message: UIMessage): ChatAttachment[] | undefined {
  const fromParts = message.parts
    .filter((part) => part.type === "file")
    .map((part) => ({
      id: part.filename ?? part.url.slice(0, 24),
      name: part.filename ?? "attachment",
      size: 0,
      type: part.mediaType,
      dataUrl: part.url,
      isImage: part.mediaType.startsWith("image/"),
    }));

  return fromParts.length > 0 ? fromParts : readCustom(message).chatAttachments;
}

/** store 里的消息 → runtime 的初始消息 */
export function toUIMessages(messages: readonly ChatMessage[]): UIMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: [
      ...(message.thinking ? [{ type: "reasoning" as const, text: message.thinking }] : []),
      ...(message.content ? [{ type: "text" as const, text: message.content }] : []),
    ],
    metadata: {
      custom: {
        sources: message.sources,
        thinkingDuration: message.thinkingDuration,
        chatAttachments: message.attachments,
        createdAt: message.createdAt,
      } satisfies ChatCustomMetadata,
    },
  }));
}

/** 只依赖 runtime 消息的结构，避免把 UI 类型引进 store */
interface MessageLike {
  id: string;
  role: ChatMessage["role"];
  parts: readonly {
    type: string;
    text?: string;
    data?: string;
    mimeType?: string;
    filename?: string;
    image?: string;
  }[];
  metadata?: unknown;
}

/** runtime 的消息 → store 的消息 */
export function toChatMessage(message: MessageLike): ChatMessage {
  const custom = readCustom(message);
  const thinking = message.parts
    .filter((part) => part.type === "reasoning")
    .map((part) => part.text ?? "")
    .join("");

  return {
    id: message.id,
    role: message.role,
    content: textOf(message),
    createdAt: custom.createdAt ?? Date.now(),
    thinking: thinking || undefined,
    thinkingDuration: custom.thinkingDuration,
    sources: custom.sources,
    attachments: attachmentsOfParts(message.parts) ?? custom.chatAttachments,
  };
}

/** 附件在 runtime 里是 file/image parts，store 仍用 ChatAttachment 表达 */
function attachmentsOfParts(
  parts: readonly {
    type: string;
    data?: string;
    mimeType?: string;
    filename?: string;
    image?: string;
  }[],
): ChatAttachment[] | undefined {
  const list = parts
    .map((part): ChatAttachment | null => {
      if (part.type === "file") {
        return {
          id: part.filename ?? Math.random().toString(36).slice(2, 9),
          name: part.filename ?? "attachment",
          size: 0,
          type: part.mimeType ?? "application/octet-stream",
          dataUrl: part.data,
          isImage: part.mimeType?.startsWith("image/"),
        };
      }
      if (part.type === "image" && part.image) {
        return {
          id: Math.random().toString(36).slice(2, 9),
          name: "image",
          size: 0,
          type: "image/png",
          dataUrl: part.image,
          isImage: true,
        };
      }
      return null;
    })
    .filter((item): item is ChatAttachment => item !== null);

  return list.length > 0 ? list : undefined;
}

/**
 * 面向 `useChatRuntime` 的本地传输。
 * 不经过 HTTP：直接把 UIMessage 历史交给 `streamText`，再把增量写成 UIMessageChunk。
 */
export class LocalChatTransport implements ChatTransport<UIMessage> {
  async sendMessages({
    messages,
    abortSignal,
  }: {
    messages: UIMessage[];
    abortSignal?: AbortSignal;
  }): Promise<ReadableStream<UIMessageChunk>> {
    const settings = useSettingsStore.getState();
    const store = useChatStore.getState();

    const history = messages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({
        role: message.role as "user" | "assistant",
        content: textOf(message),
        attachments: attachmentsOf(message),
      }));

    // 新一轮开始，清掉上一轮的错误提示
    store.setRunError(null);

    const textId = `text-${Date.now()}`;
    let reasoningId: string | null = null;
    let textStarted = false;

    return new ReadableStream<UIMessageChunk>({
      start: (controller) => {
        // 中断后 runtime 会取消读取，再 enqueue/close 会抛 Invalid state，统一用 settled 兼住
        let settled = false;

        const safeEnqueue = (chunk: UIMessageChunk) => {
          if (settled) return;
          try {
            controller.enqueue(chunk);
          } catch {
            settled = true;
          }
        };

        const safeClose = () => {
          if (settled) return;
          settled = true;
          try {
            controller.close();
          } catch {
            /* 已关闭 */
          }
        };

        const safeError = (error: unknown) => {
          if (settled) return;
          settled = true;
          try {
            controller.error(error);
          } catch {
            /* 已关闭 */
          }
        };

        const ensureReasoning = () => {
          if (reasoningId) return;
          reasoningId = `reason-${Date.now()}`;
          safeEnqueue({ type: "reasoning-start", id: reasoningId });
        };

        const closeReasoning = () => {
          if (!reasoningId) return;
          safeEnqueue({ type: "reasoning-end", id: reasoningId });
          reasoningId = null;
        };

        const ensureText = () => {
          if (textStarted) return;
          closeReasoning();
          textStarted = true;
          safeEnqueue({ type: "text-start", id: textId });
        };

        // 停止按钮：立即结束流，不等 provider 响应 abort
        abortSignal?.addEventListener("abort", safeClose, { once: true });

        void executeStreamChat({
          modelId: settings.selectedModelId,
          messages: history,
          thinkingEnabled: settings.thinkingEnabled,
          abortSignal,
          onChunk: (delta) => {
            ensureText();
            safeEnqueue({ type: "text-delta", id: textId, delta });
          },
          onReasoning: (delta) => {
            ensureReasoning();
            if (reasoningId) {
              safeEnqueue({ type: "reasoning-delta", id: reasoningId, delta });
            }
          },
        })
          .then(() => {
            closeReasoning();
            if (textStarted) safeEnqueue({ type: "text-end", id: textId });
            safeClose();
          })
          .catch((error: unknown) => {
            // 用户主动停止不算错误
            if (abortSignal?.aborted) safeClose();
            else {
              // runtime 不会把传输层异常暴露成消息状态，错误提示在这里直接落库
              useChatStore.getState().setRunError(i18n.t("errors.generationFailed"));
              safeError(error);
            }
          });
      },
    });
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    return null;
  }
}
