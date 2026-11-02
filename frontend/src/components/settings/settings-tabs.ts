import { AppWindow, Bell, Cpu, FolderKanban, Keyboard, Palette, Sliders } from "lucide-react";
import type * as React from "react";

export interface SettingsTabMeta {
  id: string;
  /** i18n key，渲染时再取文案 */
  labelKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** 设置面板的分类定义（顺序即导航顺序） */
export const SETTINGS_TABS: readonly SettingsTabMeta[] = [
  {
    id: "general",
    labelKey: "settings.tabs.general.label",
    descriptionKey: "settings.tabs.general.description",
    icon: Sliders,
  },
  {
    id: "application",
    labelKey: "settings.tabs.application.label",
    descriptionKey: "settings.tabs.application.description",
    icon: AppWindow,
  },
  {
    id: "appearance",
    labelKey: "settings.tabs.appearance.label",
    descriptionKey: "settings.tabs.appearance.description",
    icon: Palette,
  },
  {
    id: "shortcuts",
    labelKey: "settings.tabs.shortcuts.label",
    descriptionKey: "settings.tabs.shortcuts.description",
    icon: Keyboard,
  },
  {
    id: "notifications",
    labelKey: "settings.tabs.notifications.label",
    descriptionKey: "settings.tabs.notifications.description",
    icon: Bell,
  },
  {
    id: "models",
    labelKey: "settings.tabs.models.label",
    descriptionKey: "settings.tabs.models.description",
    icon: Cpu,
  },
  {
    id: "projects",
    labelKey: "settings.tabs.projects.label",
    descriptionKey: "settings.tabs.projects.description",
    icon: FolderKanban,
  },
];

export type SettingsTabId = (typeof SETTINGS_TABS)[number]["id"];

/** 把任意字符串收敛到合法的 tab id，避免持久化的脏数据导致面板空白 */
export function normalizeSettingsTab(tab: string): SettingsTabId {
  return SETTINGS_TABS.some((item) => item.id === tab) ? (tab as SettingsTabId) : "general";
}

/** 取分类元信息 */
export function getSettingsTab(tab: string): SettingsTabMeta {
  const id = normalizeSettingsTab(tab);
  return SETTINGS_TABS.find((item) => item.id === id) ?? SETTINGS_TABS[0];
}
