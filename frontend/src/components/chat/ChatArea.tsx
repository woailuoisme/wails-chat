import { useAui } from "@assistant-ui/react";
import { useTranslation } from "react-i18next";

import { ErrorState } from "@/components/assistant-ui/elements/error-state";
import { Thread } from "@/components/assistant-ui/elements/thread.aui";
import { useChatStore } from "@/lib/store/chat-store";

import { ModelPicker } from "./input/ModelPicker";

/** 生成版 composer 只留了 ComposerExtra 槽位：模型 + 推理档位都在 ModelPicker 里 */
function ComposerTools() {
  return <ModelPicker />;
}

/** 运行失败时用 ErrorState 提示；runtime 不产出正文，错误必须显式展示 */
function RunErrorBanner() {
  const { t } = useTranslation();
  const aui = useAui();
  const runError = useChatStore((s) => s.runError);

  if (!runError) return null;

  return (
    <div className="px-4 pt-2">
      <ErrorState
        title={t("errors.generationFailedTitle")}
        detail={runError}
        retrying={false}
        onRetry={() => {
          useChatStore.getState().setRunError(null);
          aui.thread.startRun({ parentId: null });
        }}
      />
    </div>
  );
}

/**
 * 对话区装配。
 *
 * Thread 由 `assistant-ui add thread` 生成；会话列表/历史由 thread runtime 管理，
 * 这里只负责 runtime、错误提示与两个自有控件。
 */
export function ChatArea() {
  return (
    <div className="bg-background relative flex h-full flex-1 flex-col overflow-hidden">
      <RunErrorBanner />
      {/* Thread 根节点是 h-full，必须由这层拿到确定高度，否则 viewport 会塌成 0 */}
      <div className="min-h-0 flex-1">
        <Thread components={{ ComposerExtra: ComposerTools }} />
      </div>
    </div>
  );
}
