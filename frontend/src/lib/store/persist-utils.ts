/**
 * 持久化相关的纯函数集合。
 *
 * 这里**只允许**依赖类型，不得 import store、localStorage 或任何平台模块，
 * 否则无法在 `vitest` 的纯 Node 环境下被单测覆盖。
 */

/** 对话 store 真正落盘的字段 */
export const SETTINGS_PERSIST_VERSION = 2;

/** 历史上以明文写入 localStorage 的字段（v1 遗留，v2 起改由系统钥匙串保管） */
export const SECRET_STORAGE_FIELDS = [
  "openrouterApiKey",
  "deepseekApiKey",
  "openaiApiKey",
  "customApiKey",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function migrateSettingsPersistedState(
  persisted: unknown,
  version: number,
): Record<string, unknown> {
  if (!isRecord(persisted)) return {};

  const next: Record<string, unknown> = { ...persisted };

  if (version < SETTINGS_PERSIST_VERSION) {
    for (const field of SECRET_STORAGE_FIELDS) {
      delete next[field];
    }
  }

  return next;
}

/**
 * 清理 v1 遗留在 localStorage 里的明文密钥。
 *
 * 入参是 `localStorage` 中的原始字符串（`{ state, version }` 结构）。
 * 返回清洗后的新字符串；无需处理时返回 `null`，调用方据此跳过写盘。
 */
export function scrubLegacySecrets(rawSettingsJson: string): string | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawSettingsJson);
  } catch {
    return null;
  }

  if (!isRecord(parsed) || !isRecord(parsed.state)) return null;

  const state = parsed.state;
  const hasSecret = SECRET_STORAGE_FIELDS.some((field) => {
    const value = state[field];
    return typeof value === "string" && value.length > 0;
  });

  if (!hasSecret) return null;

  const nextState: Record<string, unknown> = { ...state };
  for (const field of SECRET_STORAGE_FIELDS) {
    delete nextState[field];
  }

  return JSON.stringify({
    ...parsed,
    state: nextState,
    version: SETTINGS_PERSIST_VERSION,
  });
}
