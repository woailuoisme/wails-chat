import { useAui } from "@assistant-ui/react";
import { FolderKanban, Layers, Plus, Search, Settings, Sliders } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { ThreadList } from "@/components/assistant-ui/elements/thread-list.aui";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useArtifactsStore } from "@/lib/store/artifacts-store";
import { useChatStore } from "@/lib/store/chat-store";
import { useSettingsStore } from "@/lib/store/settings-store";

export function AppSidebar() {
  const { t } = useTranslation();
  const aui = useAui();
  const setCommandPaletteOpen = useChatStore((state) => state.setCommandPaletteOpen);
  const artifactsList = useArtifactsStore((state) => state.artifactsList);
  const openArtifact = useArtifactsStore((state) => state.openArtifact);
  const setIsSettingsOpen = useSettingsStore((state) => state.setIsSettingsOpen);
  const setActiveSettingsTab = useSettingsStore((state) => state.setActiveSettingsTab);

  const openSettingsTab = React.useCallback(
    (tab: string) => {
      setActiveSettingsTab(tab);
      setIsSettingsOpen(true);
    },
    [setActiveSettingsTab, setIsSettingsOpen],
  );

  return (
    <aside className="border-border/60 bg-sidebar/50 text-sidebar-foreground flex h-full w-64 shrink-0 flex-col border-r select-none">
      {/* 为 macOS 红绿灯留出空间，同时作为拖窗手柄 */}
      <div
        data-drag-region
        className="w-full shrink-0"
        style={{ height: "var(--titlebar-inset)" }}
      />

      <div className="space-y-1 px-3 pb-3">
        <Button
          onClick={() => aui.threads.switchToNewThread()}
          className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:text-primary h-9 w-full justify-start gap-2 rounded-xl border text-xs font-medium shadow-none"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span>{t("palette.newChat")}</span>
        </Button>

        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-ring flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <span className="flex items-center gap-2">
            <Search className="size-4 opacity-70" aria-hidden="true" />
            <span>{t("nav.search")}</span>
          </span>
          <kbd className="border-border/60 bg-muted/50 text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => openSettingsTab("projects")}
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-ring flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <FolderKanban className="size-4 opacity-70" aria-hidden="true" />
          <span>{t("nav.projectInstructions")}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-ring flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="flex items-center gap-2">
                <Layers className="size-4 opacity-70" aria-hidden="true" />
                <span>Artifacts</span>
              </span>
              {artifactsList.length > 0 && (
                <span className="bg-primary/15 text-primary rounded-full px-1.5 text-[10px] font-semibold">
                  {artifactsList.length}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {artifactsList.length === 0 ? (
              <div className="text-muted-foreground p-2 text-center text-xs italic">
                {t("artifacts.empty")}
              </div>
            ) : (
              artifactsList.slice(0, 8).map((artifact) => (
                <DropdownMenuItem
                  key={artifact.id}
                  onClick={() => openArtifact(artifact)}
                  className="flex cursor-pointer flex-col items-start gap-0.5 py-1.5 text-xs"
                >
                  <span className="text-foreground line-clamp-1 font-medium">{artifact.title}</span>
                  <span className="text-muted-foreground font-mono text-[10px] uppercase">
                    {artifact.type} · {artifact.language}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={() => openSettingsTab("general")}
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-ring flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <Sliders className="size-4 opacity-70" aria-hidden="true" />
          <span>{t("nav.preferences")}</span>
        </button>
      </div>

      <div className="border-border/40 mx-3 my-1 border-t" />

      {/* 会话列表：assistant-ui 生成版 ThreadList（新建/搜索/重命名/归档/删除） */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <ThreadList />
      </div>

      <div className="border-border/50 border-t p-2.5">
        <button
          type="button"
          onClick={() => openSettingsTab("general")}
          className="hover:bg-muted/60 focus-visible:ring-ring flex w-full items-center justify-between rounded-xl p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="bg-primary/20 text-primary flex size-7 items-center justify-center rounded-full text-xs font-semibold">
              S
            </span>
            <span className="min-w-0 text-left">
              <span className="text-foreground block truncate text-xs font-medium">
                Starter Desktop
              </span>
              <span className="text-muted-foreground block text-[10px]">{t("app.subtitle")}</span>
            </span>
          </span>
          <Settings className="text-muted-foreground size-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
