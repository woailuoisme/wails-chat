import { useTranslation } from "react-i18next";

import {
  CODE_FONT_FAMILIES,
  useSettingsStore,
  type AppFontSize,
  type AppTheme,
  type ChatWidth,
} from "@/lib/store/settings-store";

import { SegmentedControl } from "../SegmentedControl";
import { SettingCard } from "../SettingCard";

const THEME_VALUES: ReadonlyArray<AppTheme> = ["dark", "light", "system"];
const FONT_SIZE_VALUES: ReadonlyArray<AppFontSize> = ["small", "medium", "large"];
const CHAT_WIDTH_VALUES: ReadonlyArray<ChatWidth> = ["standard", "wide", "full"];

export function AppearanceTab() {
  const { t } = useTranslation();
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const fontSize = useSettingsStore((state) => state.fontSize);
  const setFontSize = useSettingsStore((state) => state.setFontSize);
  const codeFont = useSettingsStore((state) => state.codeFont);
  const setCodeFont = useSettingsStore((state) => state.setCodeFont);
  const chatWidth = useSettingsStore((state) => state.chatWidth);
  const setChatWidth = useSettingsStore((state) => state.setChatWidth);

  const themeOptions = THEME_VALUES.map((value) => ({
    value,
    label: t(`settings.appearance.theme.${value}`),
  }));
  const fontSizeOptions = FONT_SIZE_VALUES.map((value) => ({
    value,
    label: t(`settings.appearance.fontSize.${value}`),
  }));
  const chatWidthOptions = CHAT_WIDTH_VALUES.map((value) => ({
    value,
    label: t(`settings.appearance.chatWidth.${value}`),
  }));
  const codeFontOptions = CODE_FONT_FAMILIES.map((font) => ({ value: font, label: font }));

  return (
    <div className="space-y-4">
      <SettingCard
        title={t("settings.appearance.theme.title")}
        description={t("settings.appearance.theme.description")}
      >
        <SegmentedControl
          ariaLabel={t("settings.appearance.theme.title")}
          value={theme}
          options={themeOptions}
          onChange={setTheme}
        />
      </SettingCard>

      <SettingCard
        title={t("settings.appearance.fontSize.title")}
        description={t("settings.appearance.fontSize.description")}
      >
        <SegmentedControl
          ariaLabel={t("settings.appearance.fontSize.title")}
          value={fontSize}
          options={fontSizeOptions}
          onChange={setFontSize}
        />
      </SettingCard>

      <SettingCard
        title={t("settings.appearance.codeFont.title")}
        description={t("settings.appearance.codeFont.description")}
      >
        <SegmentedControl
          ariaLabel={t("settings.appearance.codeFont.title")}
          value={codeFont}
          options={codeFontOptions}
          onChange={setCodeFont}
          className="flex-wrap"
        />
      </SettingCard>

      <SettingCard
        title={t("settings.appearance.chatWidth.title")}
        description={t("settings.appearance.chatWidth.description")}
      >
        <SegmentedControl
          ariaLabel={t("settings.appearance.chatWidth.title")}
          value={chatWidth}
          options={chatWidthOptions}
          onChange={setChatWidth}
        />
      </SettingCard>

      <SettingCard
        title={t("settings.appearance.preview.title")}
        description={t("settings.appearance.preview.description")}
      >
        <div className="border-border/50 bg-background space-y-2 rounded-lg border p-3">
          <p
            className="text-foreground leading-relaxed"
            style={{ fontSize: "var(--chat-font-size)" }}
          >
            {t("settings.appearance.preview.body")}
          </p>
          <code
            className="text-muted-foreground block font-mono"
            style={{ fontSize: "var(--chat-code-font-size)" }}
          >
            const total = items.reduce((sum, item) =&gt; sum + item.price, 0);
          </code>
        </div>
      </SettingCard>
    </div>
  );
}
