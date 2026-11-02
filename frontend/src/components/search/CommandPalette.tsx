import { useAui, useAuiState } from "@assistant-ui/react";
import { Layers, MessageSquare, Plus, Settings, Sparkles } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { AVAILABLE_MODELS } from "@/lib/ai/types";
import { useArtifactsStore } from "@/lib/store/artifacts-store";
import { useChatStore } from "@/lib/store/chat-store";
import { useSettingsStore } from "@/lib/store/settings-store";

/**
 * 全局命令面板。
 *
 * ⌘K 的注册已收敛到 `use-app-shortcuts`，这里只负责渲染。
 * 消息条数按需从 store 快照读取，避免面板常驻时被流式更新反复唤醒。
 */
export function CommandPalette() {
  const { t } = useTranslation();
  const aui = useAui();
  const threads = useAuiState((state) => state.threads.threadItems);
  const isCommandPaletteOpen = useChatStore((state) => state.isCommandPaletteOpen);
  const setCommandPaletteOpen = useChatStore((state) => state.setCommandPaletteOpen);

  const artifactsList = useArtifactsStore((state) => state.artifactsList);
  const openArtifact = useArtifactsStore((state) => state.openArtifact);

  const selectedModelId = useSettingsStore((state) => state.selectedModelId);
  const setSelectedModelId = useSettingsStore((state) => state.setSelectedModelId);
  const setIsSettingsOpen = useSettingsStore((state) => state.setIsSettingsOpen);

  const closePalette = React.useCallback(() => {
    setCommandPaletteOpen(false);
  }, [setCommandPaletteOpen]);

  return (
    <CommandDialog
      open={isCommandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      title={t("palette.title")}
      description={t("palette.description")}
    >
      {/* ui/command 是 shadcn 生成物不能改：CommandDialog 不自带根，
          Input/List/Item 必须包在 Command 里才能拿到 cmdk store context */}
      <Command>
        <CommandInput placeholder={t("palette.placeholder")} />
        <CommandList className="max-h-80 overflow-y-auto">
          <CommandEmpty>{t("palette.empty")}</CommandEmpty>

          <CommandGroup heading={t("palette.actions")}>
            <CommandItem
              onSelect={() => {
                aui.threads.switchToNewThread();
                closePalette();
              }}
              className="cursor-pointer gap-2 text-xs"
            >
              <Plus className="text-primary size-3.5" aria-hidden="true" />
              <span>{t("palette.newChat")}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setIsSettingsOpen(true);
                closePalette();
              }}
              className="cursor-pointer gap-2 text-xs"
            >
              <Settings className="text-muted-foreground size-3.5" aria-hidden="true" />
              <span>{t("palette.openSettings")}</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {threads.length > 0 && (
            <CommandGroup heading={t("palette.conversations")}>
              {threads.map((conversation) => {
                return (
                  <CommandItem
                    key={conversation.id}
                    value={`${conversation.title ?? t("palette.newConversation")} ${conversation.id}`}
                    onSelect={() => {
                      aui.threads.switchToThread(conversation.id);
                      closePalette();
                    }}
                    className="flex cursor-pointer items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <MessageSquare className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
                      <span className="truncate">
                        {conversation.title ?? t("palette.newConversation")}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          <CommandSeparator />

          {artifactsList.length > 0 && (
            <CommandGroup heading="Artifacts">
              {artifactsList.map((artifact) => (
                <CommandItem
                  key={artifact.id}
                  value={`${artifact.title} ${artifact.language} ${artifact.type}`}
                  onSelect={() => {
                    openArtifact(artifact);
                    closePalette();
                  }}
                  className="flex cursor-pointer items-center justify-between gap-2 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Layers className="text-primary/80 size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{artifact.title}</span>
                  </div>
                  <span className="text-muted-foreground font-mono text-[10px] uppercase">
                    {artifact.type}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          <CommandGroup heading={t("palette.switchModel")}>
            {AVAILABLE_MODELS.map((model) => (
              <CommandItem
                key={model.id}
                value={model.name}
                onSelect={() => {
                  setSelectedModelId(model.id);
                  closePalette();
                }}
                className="flex cursor-pointer items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary size-3.5" aria-hidden="true" />
                  <span>{model.name}</span>
                </div>
                {selectedModelId === model.id && (
                  <span className="text-primary text-[10px] font-semibold">
                    {t("palette.current")}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
