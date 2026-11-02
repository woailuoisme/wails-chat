import type { ChatMessage } from "@/lib/ai/types";

import { hasAnyThread, upsertThread } from "./thread-store";

/** 旧 zustand 持久化键，迁移后保留不删，作为回滚点 */
const LEGACY_KEY = "claude-desktop-chat";

interface LegacyState {
  conversations?: {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
  }[];
  messages?: Record<string, ChatMessage[]>;
}

function readLegacy(): LegacyState | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as { state?: LegacyState }).state ?? null;
  } catch {
    return null;
  }
}

/**
 * 把旧会话迁移成 thread 记录（id 保持不变）。
 *
 * 消息不在这里搬：history adapter 首次加载时会回落到旧 key 读取，
 * 之后再写入新格式，避免猜测 runtime 的存储编码。
 */
export function migrateLegacyChat(): void {
  if (hasAnyThread()) return;

  const legacy = readLegacy();
  if (!legacy?.conversations?.length) return;

  for (const conversation of legacy.conversations) {
    upsertThread({
      remoteId: conversation.id,
      title: conversation.title,
      status: "regular",
      createdAt: conversation.createdAt,
      lastMessageAt: conversation.updatedAt,
    });
  }
}

/** 旧存储里某会话的消息，仅供 history adapter 首次加载使用 */
export function readLegacyMessages(remoteId: string): ChatMessage[] | null {
  const legacy = readLegacy();
  const messages = legacy?.messages?.[remoteId];
  return messages?.length ? messages : null;
}
