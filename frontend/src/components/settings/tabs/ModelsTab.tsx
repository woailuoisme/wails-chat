import * as React from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ApiKeyProvider } from "@/lib/platform/secure-store";
import { persistApiKey, useSettingsStore, type ReasoningEffort } from "@/lib/store/settings-store";

import { SegmentedControl } from "../SegmentedControl";
import { SettingCard, SettingRow } from "../SettingCard";

const EFFORT_OPTIONS: ReadonlyArray<{ value: ReasoningEffort; label: string }> = [
  { value: "low", label: "low" },
  { value: "medium", label: "medium" },
  { value: "high", label: "high" },
];

interface ProviderCardProps {
  provider: ApiKeyProvider;
  title: string;
  description: string;
  keyPlaceholder: string;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  baseUrl: string;
  onBaseUrlChange: (value: string) => void;
  baseUrlPlaceholder: string;
  tone?: "default" | "primary";
  footer?: React.ReactNode;
}

/**
 * 单个 Provider 的配置卡片。
 * API Key 只在离焦时写入钥匙串，避免每次按键都触发一次系统调用。
 */
function ProviderCard({
  provider,
  title,
  description,
  keyPlaceholder,
  apiKey,
  onApiKeyChange,
  baseUrl,
  onBaseUrlChange,
  baseUrlPlaceholder,
  tone = "default",
  footer,
}: ProviderCardProps) {
  const keyInputId = `api-key-${provider}`;
  const baseUrlInputId = `api-base-url-${provider}`;

  const handleBlur = React.useCallback(() => {
    void persistApiKey(provider, apiKey);
  }, [apiKey, provider]);

  return (
    <SettingCard title={title} description={description} tone={tone} footnote={footer}>
      <div className="space-y-2">
        <Label htmlFor={keyInputId} className="text-muted-foreground text-[11px]">
          API Key
        </Label>
        <Input
          id={keyInputId}
          type="password"
          placeholder={keyPlaceholder}
          value={apiKey}
          onChange={(event) => onApiKeyChange(event.target.value)}
          onBlur={handleBlur}
          autoComplete="off"
          className="bg-background h-8 font-mono text-xs"
        />

        <Label htmlFor={baseUrlInputId} className="text-muted-foreground pt-1 text-[11px]">
          Base URL
        </Label>
        <Input
          id={baseUrlInputId}
          type="text"
          placeholder={baseUrlPlaceholder}
          value={baseUrl}
          onChange={(event) => onBaseUrlChange(event.target.value)}
          className="bg-background h-8 font-mono text-xs"
        />
      </div>
    </SettingCard>
  );
}

export function ModelsTab() {
  const { t } = useTranslation();
  const openrouterApiKey = useSettingsStore((state) => state.openrouterApiKey);
  const setOpenrouterApiKey = useSettingsStore((state) => state.setOpenrouterApiKey);
  const openrouterBaseUrl = useSettingsStore((state) => state.openrouterBaseUrl);
  const setOpenrouterBaseUrl = useSettingsStore((state) => state.setOpenrouterBaseUrl);

  const deepseekApiKey = useSettingsStore((state) => state.deepseekApiKey);
  const setDeepseekApiKey = useSettingsStore((state) => state.setDeepseekApiKey);
  const deepseekBaseUrl = useSettingsStore((state) => state.deepseekBaseUrl);
  const setDeepseekBaseUrl = useSettingsStore((state) => state.setDeepseekBaseUrl);

  const openaiApiKey = useSettingsStore((state) => state.openaiApiKey);
  const setOpenaiApiKey = useSettingsStore((state) => state.setOpenaiApiKey);
  const openaiBaseUrl = useSettingsStore((state) => state.openaiBaseUrl);
  const setOpenaiBaseUrl = useSettingsStore((state) => state.setOpenaiBaseUrl);

  const customApiKey = useSettingsStore((state) => state.customApiKey);
  const setCustomApiKey = useSettingsStore((state) => state.setCustomApiKey);
  const customBaseUrl = useSettingsStore((state) => state.customBaseUrl);
  const setCustomBaseUrl = useSettingsStore((state) => state.setCustomBaseUrl);

  const thinkingEnabled = useSettingsStore((state) => state.thinkingEnabled);
  const setThinkingEnabled = useSettingsStore((state) => state.setThinkingEnabled);
  const reasoningEffort = useSettingsStore((state) => state.reasoningEffort);
  const setReasoningEffort = useSettingsStore((state) => state.setReasoningEffort);
  const thinkingBudget = useSettingsStore((state) => state.thinkingBudget);
  const setThinkingBudget = useSettingsStore((state) => state.setThinkingBudget);

  return (
    <div className="space-y-4">
      <ProviderCard
        provider="openrouter"
        title={t("settings.models.providers.openrouter.title")}
        description={t("settings.models.providers.openrouter.description")}
        keyPlaceholder="sk-or-v1-…"
        apiKey={openrouterApiKey}
        onApiKeyChange={setOpenrouterApiKey}
        baseUrl={openrouterBaseUrl}
        onBaseUrlChange={setOpenrouterBaseUrl}
        baseUrlPlaceholder="https://openrouter.ai/api/v1"
        tone="primary"
        footer={t("settings.models.providers.keychainNote")}
      />

      <ProviderCard
        provider="deepseek"
        title={t("settings.models.providers.deepseek.title")}
        description={t("settings.models.providers.deepseek.description")}
        keyPlaceholder="sk-…"
        apiKey={deepseekApiKey}
        onApiKeyChange={setDeepseekApiKey}
        baseUrl={deepseekBaseUrl}
        onBaseUrlChange={setDeepseekBaseUrl}
        baseUrlPlaceholder="https://api.deepseek.com"
      />

      <ProviderCard
        provider="openai"
        title={t("settings.models.providers.openai.title")}
        description={t("settings.models.providers.openai.description")}
        keyPlaceholder="sk-…"
        apiKey={openaiApiKey}
        onApiKeyChange={setOpenaiApiKey}
        baseUrl={openaiBaseUrl}
        onBaseUrlChange={setOpenaiBaseUrl}
        baseUrlPlaceholder="https://api.openai.com/v1"
      />

      <ProviderCard
        provider="custom"
        title={t("settings.models.providers.custom.title")}
        description={t("settings.models.providers.custom.description")}
        keyPlaceholder="ollama"
        apiKey={customApiKey}
        onApiKeyChange={setCustomApiKey}
        baseUrl={customBaseUrl}
        onBaseUrlChange={setCustomBaseUrl}
        baseUrlPlaceholder="http://localhost:11434/v1"
      />

      <SettingCard
        title={t("settings.models.reasoning.title")}
        description={t("settings.models.reasoning.description")}
      >
        <div className="divide-border/40 divide-y">
          <SettingRow
            label={t("settings.models.thinking.label")}
            description={t("settings.models.thinking.description")}
            htmlFor="thinking-enabled"
            className="pb-3"
          >
            <Switch
              id="thinking-enabled"
              checked={thinkingEnabled}
              onCheckedChange={setThinkingEnabled}
            />
          </SettingRow>

          <SettingRow
            label={t("settings.models.effort.label")}
            description={t("settings.models.effort.description")}
            className="py-3"
          >
            <SegmentedControl
              ariaLabel={t("settings.models.effort.label")}
              value={reasoningEffort}
              options={EFFORT_OPTIONS.map((option) => ({
                ...option,
                label: t(`settings.models.effort.${option.value}`),
              }))}
              onChange={setReasoningEffort}
            />
          </SettingRow>

          <div className="pt-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="thinking-budget" className="text-foreground text-xs font-medium">
                {t("settings.models.budget")}
              </Label>
              <span className="text-primary font-mono text-xs font-medium">
                {thinkingBudget} tokens
              </span>
            </div>
            <input
              id="thinking-budget"
              type="range"
              min={1024}
              max={32000}
              step={1024}
              value={thinkingBudget}
              onChange={(event) => setThinkingBudget(Number(event.target.value))}
              className="accent-primary mt-2 w-full"
            />
          </div>
        </div>
      </SettingCard>
    </div>
  );
}
