import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 应用级 UI 状态。
 *
 * 会话与消息已迁到 assistant-ui 的 thread runtime（见 `lib/chat/thread-store.ts`），
 * 这里只保留 runtime 不负责的部分：输入框草稿、命令面板开关、最近一次运行错误。
 */
const PERSIST_KEY = "claude-desktop-ui-v1";

interface UiState {
  /** 按会话（thread remoteId）保存的输入框草稿，受 `autoSaveDrafts` 控制 */
  drafts: Record<string, string>;
  isCommandPaletteOpen: boolean;
  /** 当前会话最近一次生成失败的提示；成功或重新发送时清空 */
  runError: string | null;

  setDraft: (conversationId: string, text: string) => void;
  clearDraft: (conversationId: string) => void;
  clearAllDrafts: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setRunError: (message: string | null) => void;
}

export const useChatStore = create<UiState>()(
  persist(
    (set) => ({
      drafts: {},
      isCommandPaletteOpen: false,
      runError: null,

      setDraft: (conversationId, text) => {
        set((state) => ({ drafts: { ...state.drafts, [conversationId]: text } }));
      },

      clearDraft: (conversationId) => {
        set((state) => {
          if (state.drafts[conversationId] === undefined) return state;
          const drafts = { ...state.drafts };
          delete drafts[conversationId];
          return { drafts };
        });
      },

      clearAllDrafts: () => set({ drafts: {} }),

      setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),

      setRunError: (runError) => set({ runError }),
    }),
    { name: PERSIST_KEY, partialize: (state) => ({ drafts: state.drafts }) },
  ),
);
