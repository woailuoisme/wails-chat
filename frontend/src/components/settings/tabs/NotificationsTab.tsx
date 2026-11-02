import { useTranslation } from "react-i18next";

import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/lib/store/settings-store";

import { SettingCard, SettingRow } from "../SettingCard";

export function NotificationsTab() {
  const { t } = useTranslation();
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((state) => state.setNotificationsEnabled);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled);

  return (
    <div className="space-y-4">
      <SettingCard title={t("settings.notifications.title")}>
        <div className="divide-border/40 divide-y">
          <SettingRow
            label={t("settings.notifications.system.label")}
            description={t("settings.notifications.system.description")}
            htmlFor="notifications-enabled"
            className="pb-3"
          >
            <Switch
              id="notifications-enabled"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </SettingRow>

          <SettingRow
            label={t("settings.notifications.sound.label")}
            description={t("settings.notifications.sound.description")}
            htmlFor="sound-enabled"
            className="pt-3"
          >
            <Switch id="sound-enabled" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </SettingRow>
        </div>
      </SettingCard>
    </div>
  );
}
