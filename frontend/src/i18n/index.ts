import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { useSettingsStore } from "@/lib/store/settings-store";

import en from "./locales/en.json";
import zh from "./locales/zh.json";

/** 语音识别要的是 BCP-47，store 里存的是 "zh" / "en" */
export function speechLocale(language: string): string {
  return language === "zh" ? "zh-CN" : "en-US";
}

// persist 同步 hydrate，初始化时就能读到用户上次选的语言
void i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: useSettingsStore.getState().language,
  fallbackLng: "zh",
  interpolation: { escapeValue: false },
  returnNull: false,
});

if (import.meta.env.DEV) {
  // 两语言 key 数量不一致通常意味着漏翻
  const count = (value: object): number =>
    Object.values(value).reduce<number>(
      (sum, child) => sum + (child !== null && typeof child === "object" ? count(child) : 1),
      0,
    );
  if (count(zh) !== count(en)) {
    console.warn(`[i18n] key 数量不一致：zh=${count(zh)} en=${count(en)}`);
  }
}

export default i18n;
