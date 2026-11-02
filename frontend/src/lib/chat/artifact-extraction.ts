import { resolveArtifactType } from "@/lib/ai/artifacts";
import type { ArtifactItem } from "@/lib/ai/types";

/** 只有带预览能力的语言才值得自动弹面板 */
const CODE_BLOCK_REGEX =
  /```(html|jsx|tsx|react|svg|mermaid|typescript|javascript|python)\s*\n([\s\S]*?)```/i;

/** 低于该长度的片段通常只是示例，不值得打断对话 */
const MIN_BODY_LENGTH = 80;

/**
 * 从一条完整回答里提取首个可预览的代码块。
 * 纯函数：不碰 store、不产生副作用，调用方决定是否打开面板。
 */
export function extractArtifact(content: string, messageId: string): ArtifactItem | null {
  const match = CODE_BLOCK_REGEX.exec(content);
  if (!match) return null;

  const body = match[2].trim();
  if (body.length <= MIN_BODY_LENGTH) return null;

  const language = match[1].toLowerCase();
  const now = Date.now();

  return {
    id: `art-${messageId}`,
    messageId,
    title: `${language.toUpperCase()} Application`,
    type: resolveArtifactType(language),
    language,
    content: body,
    versions: [{ version: 1, content: body, timestamp: now }],
    currentVersion: 1,
    createdAt: now,
  };
}
