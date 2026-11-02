import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore, type AppLanguage } from "@/lib/store/settings-store";

import { SegmentedControl } from "../SegmentedControl";
import { SettingCard, SettingRow } from "../SettingCard";

export function GeneralTab() {
  const { t } = useTranslation();
  const launchOnStartup = useSettingsStore((state) => state.launchOnStartup);
  const setLaunchOnStartup = useSettingsStore((state) => state.setLaunchOnStartup);
  const keepWindowOnTop = useSettingsStore((state) => state.keepWindowOnTop);
  const setKeepWindowOnTop = useSettingsStore((state) => state.setKeepWindowOnTop);
  const closeToTray = useSettingsStore((state) => state.closeToTray);
  const setCloseToTray = useSettingsStore((state) => state.setCloseToTray);
  const globalShortcut = useSettingsStore((state) => state.globalShortcut);
  const setGlobalShortcut = useSettingsStore((state) => state.setGlobalShortcut);
  const globalShortcutEnabled = useSettingsStore((state) => state.globalShortcutEnabled);
  const setGlobalShortcutEnabled = useSettingsStore((state) => state.setGlobalShortcutEnabled);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const languageOptions: ReadonlyArray<{ value: AppLanguage; label: string }> = [
    { value: "zh", label: t("settings.general.language.zh") },
    { value: "en", label: t("settings.general.language.en") },
  ];

  return (
    <div className="space-y-4">
      <SettingCard
        title={t("settings.general.globalShortcut.title")}
        description={t("settings.general.globalShortcut.description")}
        footnote={t("settings.general.globalShortcut.footnote")}
      >
        <div className="space-y-3">
          <SettingRow
            label={t("settings.general.enableShortcut.label")}
            description={t("settings.general.enableShortcut.description")}
            htmlFor="global-shortcut-enabled"
          >
            <Switch
              id="global-shortcut-enabled"
              checked={globalShortcutEnabled}
              onCheckedChange={setGlobalShortcutEnabled}
            />
          </SettingRow>

          <div>
            <Label htmlFor="global-shortcut" className="sr-only">
              {t("settings.general.shortcutInput.label")}
            </Label>
            <Input
              id="global-shortcut"
              aria-label={t("settings.general.shortcutInput.label")}
              value={globalShortcut}
              onChange={(event) => setGlobalShortcut(event.target.value)}
              placeholder="Option+Space"
              disabled={!globalShortcutEnabled}
              className="bg-background h-8 font-mono text-xs disabled:opacity-50"
            />
          </div>
        </div>
      </SettingCard>

      <SettingCard title={t("settings.general.integration.title")}>
        <div className="divide-border/40 divide-y">
          <SettingRow
            label={t("settings.general.launchOnStartup.label")}
            description={t("settings.general.launchOnStartup.description")}
            htmlFor="launch-on-startup"
            className="pb-3"
          >
            <Switch
              id="launch-on-startup"
              checked={launchOnStartup}
              onCheckedChange={setLaunchOnStartup}
            />
          </SettingRow>

          <SettingRow
            label={t("settings.general.keepOnTop.label")}
            description={t("settings.general.keepOnTop.description")}
            htmlFor="keep-on-top"
            className="py-3"
          >
            <Switch
              id="keep-on-top"
              checked={keepWindowOnTop}
              onCheckedChange={setKeepWindowOnTop}
            />
          </SettingRow>

          <SettingRow
            label={t("settings.general.closeToTray.label")}
            description={t("settings.general.closeToTray.description")}
            htmlFor="close-to-tray"
            className="pt-3"
          >
            <Switch id="close-to-tray" checked={closeToTray} onCheckedChange={setCloseToTray} />
          </SettingRow>
        </div>
      </SettingCard>

      <SettingCard
        title={t("settings.general.language.title")}
        description={t("settings.general.language.description")}
      >
        <SegmentedControl
          ariaLabel={t("settings.general.language.aria")}
          value={language}
          options={languageOptions}
          onChange={setLanguage}
        />
      </SettingCard>
    </div>
  );
}
