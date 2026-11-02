import { SystemService } from "../../../bindings/starter";

/** 支持独立配置 API Key 的 provider，与 settings-store 的 SECRET_FIELDS 一一对应 */
export type ApiKeyProvider = "openrouter" | "deepseek" | "openai" | "custom";

const PROVIDERS: ApiKeyProvider[] = ["openrouter", "deepseek", "openai", "custom"];

/** 从系统钥匙串一次性取回全部密钥；缺失的 provider 不出现在结果里 */
export async function loadAllSecrets(): Promise<Partial<Record<ApiKeyProvider, string>>> {
  const stored = (await SystemService.LoadSecrets(PROVIDERS)) ?? {};
  const result: Partial<Record<ApiKeyProvider, string>> = {};

  for (const provider of PROVIDERS) {
    const value = stored[provider];
    if (value) {
      result[provider] = value;
    }
  }

  return result;
}

/** 写入单个密钥；传空字符串即从钥匙串删除 */
export async function saveSecret(provider: ApiKeyProvider, value: string): Promise<void> {
  await SystemService.SaveSecret(provider, value);
}
