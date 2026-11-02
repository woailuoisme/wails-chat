import { useTranslation } from "react-i18next";

import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/lib/store/settings-store";

import { SettingCard } from "../SettingCard";

export function ProjectsTab() {
  const { t } = useTranslation();
  const systemPrompt = useSettingsStore((state) => state.systemPrompt);
  const setSystemPrompt = useSettingsStore((state) => state.setSystemPrompt);

  return (
    <div className="space-y-4">
      <SettingCard
        title={t("settings.projects.title")}
        description={t("settings.projects.description")}
        footnote={t("settings.projects.footnote")}
      >
        <Label htmlFor="system-prompt" className="sr-only">
          {t("settings.projects.aria")}
        </Label>
        <textarea
          id="system-prompt"
          rows={10}
          value={systemPrompt}
          onChange={(event) => setSystemPrompt(event.target.value)}
          placeholder={t("settings.projects.placeholder")}
          className="border-border/70 bg-background text-foreground focus:ring-primary/40 w-full resize-none rounded-lg p-3 text-xs leading-relaxed focus:ring-1 focus:outline-none"
        />
      </SettingCard>
    </div>
  );
}
