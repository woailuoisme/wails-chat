import { useChatStore } from "@/lib/store/chat-store";
import { useSettingsStore } from "@/lib/store/settings-store";

/**
 * 草稿策略：按会话隔离，且受「自动保存草稿」开关约束。
 *
 * 规则集中在这里，Composer 只负责取值与写值，不再复制这套判断。
 */
export function readDraft(conversationId: string | null): string | undefined {
  if (!conversationId || !useSettingsStore.getState().autoSaveDrafts) return undefined;
  return useChatStore.getState().drafts[conversationId];
}

export function writeDraft(conversationId: string | null, text: string): void {
  if (!conversationId || !useSettingsStore.getState().autoSaveDrafts) return;
  useChatStore.getState().setDraft(conversationId, text);
}

export function clearDraft(conversationId: string | null): void {
  if (!conversationId) return;
  useChatStore.getState().clearDraft(conversationId);
}
