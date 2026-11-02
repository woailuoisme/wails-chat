import * as React from "react";
import { useTranslation } from "react-i18next";

import { useSettingsStore } from "@/lib/store/settings-store";

import { SettingCard } from "../SettingCard";

interface ShortcutEntry {
  /** i18n key */
  actionKey: string;
  keys: string[];
  /** 系统级快捷键由 Wails 全局注册，即使窗口失焦也生效 */
  scopeKey: "settings.shortcuts.scope.app" | "settings.shortcuts.scope.system";
}

export function ShortcutsTab() {
  const { t } = useTranslation();
  const sendKey = useSettingsStore((state) => state.sendKey);
  const globalShortcut = useSettingsStore((state) => state.globalShortcut);
  const globalShortcutEnabled = useSettingsStore((state) => state.globalShortcutEnabled);

  const shortcuts = React.useMemo<ShortcutEntry[]>(
    () => [
      {
        actionKey: "settings.shortcuts.actions.newChat",
        keys: ["⌘", "N"],
        scopeKey: "settings.shortcuts.scope.app",
      },
      {
        actionKey: "settings.shortcuts.actions.palette",
        keys: ["⌘", "K"],
        scopeKey: "settings.shortcuts.scope.app",
      },
      {
        actionKey: "settings.shortcuts.actions.settings",
        keys: ["⌘", ","],
        scopeKey: "settings.shortcuts.scope.app",
      },
      {
        actionKey: "settings.shortcuts.actions.toggleSidebar",
        keys: ["⌘", "B"],
        scopeKey: "settings.shortcuts.scope.app",
      },
      {
        actionKey: "settings.shortcuts.actions.toggleArtifacts",
        keys: ["⌘", "J"],
        scopeKey: "settings.shortcuts.scope.app",
      },
      {
        actionKey: "settings.shortcuts.actions.send",
        keys: sendKey === "enter" ? ["Enter"] : ["⌘", "Enter"],
        scopeKey: "settings.shortcuts.scope.app",
      },
      {
        actionKey: "settings.shortcuts.actions.newline",
        keys: ["⇧", "Enter"],
        scopeKey: "settings.shortcuts.scope.app",
      },
      {
        actionKey: "settings.shortcuts.actions.stop",
        keys: ["Esc"],
        scopeKey: "settings.shortcuts.scope.app",
      },
      {
        actionKey: globalShortcutEnabled
          ? "settings.shortcuts.actions.global"
          : "settings.shortcuts.actions.globalDisabled",
        keys: [globalShortcut],
        scopeKey: "settings.shortcuts.scope.system",
      },
    ],
    [globalShortcut, globalShortcutEnabled, sendKey],
  );

  return (
    <SettingCard
      title={t("settings.shortcuts.title")}
      description={t("settings.shortcuts.description")}
      className="p-0"
    >
      <div className="divide-border/40 divide-y">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.actionKey}
            className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs"
          >
            <div className="min-w-0">
              <div className="text-foreground font-medium">{t(shortcut.actionKey)}</div>
              <div className="text-muted-foreground text-[10px]">{t(shortcut.scopeKey)}</div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {shortcut.keys.map((key, index) => (
                <kbd
                  key={`${shortcut.actionKey}-${index}`}
                  className="border-border/70 bg-background text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[11px] font-semibold shadow-2xs"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SettingCard>
  );
}
