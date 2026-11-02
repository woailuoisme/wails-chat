import { useAui, useAuiState } from "@assistant-ui/react";
import { Check, ChevronDown, Code2, Copy, PanelLeft, Trash2 } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AVAILABLE_MODELS } from "@/lib/ai/types";
import { useArtifactsStore } from "@/lib/store/artifacts-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import { copyText } from "@/lib/utils/clipboard";
import { buildTranscript, type TranscriptFormat } from "@/lib/utils/transcript";

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function AppHeader({ onToggleSidebar, isSidebarOpen = true }: AppHeaderProps) {
  const { t } = useTranslation();
  const aui = useAui();
  const title = useAuiState((state) => state.threadListItem.title);
  const selectedModelId = useSettingsStore((state) => state.selectedModelId);

  const isArtifactsOpen = useArtifactsStore((state) => state.isOpen);
  const togglePanel = useArtifactsStore((state) => state.togglePanel);

  // 只订阅「是否有消息」这一布尔量，避免流式期间每帧重渲染头部
  const hasMessages = useAuiState((state) => state.thread.messages.length > 0);

  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState("");
  const [copiedKind, setCopiedKind] = React.useState<TranscriptFormat | null>(null);

  React.useEffect(() => {
    if (!copiedKind) return;
    const timer = setTimeout(() => setCopiedKind(null), 2000);
    return () => clearTimeout(timer);
  }, [copiedKind]);

  const currentModel = AVAILABLE_MODELS.find((model) => model.id === selectedModelId);
  const displayTitle = !title || title === "New Thread" ? t("chat.newThreadTitle") : title;

  const openRenameDialog = React.useCallback(() => {
    if (!title) return;
    setDraftTitle(title);
    setIsRenameOpen(true);
  }, [title]);

  const submitRename = React.useCallback(() => {
    const next = draftTitle.trim();
    if (next) aui.threadListItem().rename(next);
    setIsRenameOpen(false);
  }, [aui, draftTitle]);

  const copyTranscript = React.useCallback(
    (format: TranscriptFormat) => {
      const messages = aui.thread.getState().messages.map((message) => ({
        role: message.role,
        content: message.content
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n"),
      }));
      if (messages.length === 0) return;

      copyText(
        buildTranscript(messages, title ?? t("transcript.defaultTitle"), format),
        "clipboard:transcript",
      ).then((ok) => {
        if (ok) setCopiedKind(format);
      });
    },
    [aui, t, title],
  );

  return (
    <header
      data-drag-region
      className="border-border/50 bg-background/80 flex h-11 shrink-0 items-center justify-between border-b px-3 backdrop-blur-xs select-none"
      // 侧栏收起后红绿灯落在 header 上，让出它们的宽度，否则会压住折叠按钮
      style={isSidebarOpen ? undefined : { paddingLeft: "var(--traffic-lights-width)" }}
    >
      <div className="flex items-center gap-1.5">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggleSidebar}
            className="text-muted-foreground hover:text-foreground h-7 w-7"
            aria-label={t(isSidebarOpen ? "nav.collapseSidebar" : "nav.expandSidebar")}
            title={t(isSidebarOpen ? "nav.collapseSidebarShortcut" : "nav.expandSidebarShortcut")}
          >
            <PanelLeft className="size-4" aria-hidden="true" />
          </Button>
        )}

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group text-foreground hover:bg-muted/60 focus-visible:ring-ring flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="max-w-50 truncate">{displayTitle}</span>
                <ChevronDown
                  className="text-muted-foreground group-hover:text-foreground size-3 transition-transform"
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <div className="text-muted-foreground px-2 py-1 text-[11px]">
                {t("nav.modelLabel")}
                {currentModel?.name ?? t("nav.modelUnset")}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openRenameDialog} className="cursor-pointer text-xs">
                {t("nav.renameConversation")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => aui.threadListItem().delete()}
                className="text-destructive cursor-pointer gap-2 text-xs"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                <span>{t("nav.deleteConversation")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={togglePanel}
          aria-pressed={isArtifactsOpen}
          aria-label={t(isArtifactsOpen ? "nav.closeArtifacts" : "nav.openArtifacts")}
          className={`h-7 w-7 ${
            isArtifactsOpen
              ? "bg-primary/10 text-primary border-primary/20 border"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title={t(isArtifactsOpen ? "nav.closeArtifactsShortcut" : "nav.openArtifactsShortcut")}
        >
          <Code2 className="size-4" aria-hidden="true" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={!hasMessages}
              aria-label={t("nav.copyTranscript")}
              className="text-muted-foreground hover:text-foreground h-7 w-7 disabled:opacity-30"
              title={t("nav.copyTranscript")}
            >
              {copiedKind ? (
                <Check className="size-3.5 text-green-500" aria-hidden="true" />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => copyTranscript("markdown")}
              className="cursor-pointer text-xs"
            >
              {t("nav.copyAsMarkdown")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => copyTranscript("plain")}
              className="cursor-pointer text-xs"
            >
              {t("nav.copyAsPlainText")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="max-w-sm">
          <DialogTitle>{t("nav.renameTitle")}</DialogTitle>
          <DialogDescription>{t("nav.renameDescription")}</DialogDescription>

          <Label htmlFor="rename-conversation" className="sr-only">
            {t("nav.conversationTitle")}
          </Label>
          <Input
            id="rename-conversation"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitRename();
              }
            }}
            autoFocus
            maxLength={80}
            className="h-8 text-xs"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={submitRename} disabled={!draftTitle.trim()}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
