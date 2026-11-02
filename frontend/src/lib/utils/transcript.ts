import i18n from "@/i18n";

export type TranscriptFormat = "markdown" | "plain";

/** 角色 → 展示标签；未知角色回落为原始值（跟随界面语言） */
function roleLabel(role: string): string {
  return i18n.t(`transcript.roles.${role}`, { defaultValue: role });
}

interface TranscriptMessage {
  role: string;
  content: string;
}

/**
 * 把会话拍平成文本。
 *
 * - `markdown`：带一级标题与分隔线，适合归档到笔记
 * - `plain`：逐条「我：…/助手：…」，适合直接粘贴到聊天窗口分享
 */
export function buildTranscript(
  messages: ReadonlyArray<TranscriptMessage>,
  title: string,
  format: TranscriptFormat,
): string {
  if (format === "plain") {
    return messages.map((message) => `${roleLabel(message.role)}：${message.content}`).join("\n\n");
  }

  const body = messages
    .map((message) => `**${roleLabel(message.role)}**：\n\n${message.content}`)
    .join("\n\n---\n\n");

  return `# ${title}\n\n${body}`;
}
