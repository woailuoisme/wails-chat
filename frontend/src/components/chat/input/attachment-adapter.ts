import type { AttachmentAdapter, CompleteAttachment, PendingAttachment } from "@assistant-ui/react";

import i18n from "@/i18n";
import type { ChatAttachment } from "@/lib/ai/types";

import { readFileAsAttachment } from "./attachment-utils";

/**
 * 把现有附件读取逻辑包成 assistant-ui 的 AttachmentAdapter。
 *
 * 附件内容在 `send()` 时读成 message parts，跟着消息一起进 runtime，
 * 不再用模块级 Map 暂存（那样既不会释放，也跨会话串味）。
 */

function toAttachmentType(attachment: ChatAttachment): "image" | "document" {
  return attachment.isImage || attachment.dataUrl ? "image" : "document";
}

export const attachmentAdapter: AttachmentAdapter = {
  accept: "image/*,.pdf,.txt,.md,.json,.csv,.ts,.tsx,.js,.jsx,.py",

  async add({ file }): Promise<PendingAttachment> {
    const result = await readFileAsAttachment(file);
    if (!result.ok) {
      throw new Error(result.reason);
    }

    const attachment = result.attachment;

    return {
      id: attachment.id,
      type: toAttachmentType(attachment),
      name: attachment.name,
      contentType: attachment.type,
      file,
      status: { type: "requires-action", reason: "composer-send" },
    };
  },

  async remove() {
    // 不在适配器里持有状态，无需清理
  },

  async send(attachment): Promise<CompleteAttachment> {
    const result = (await attachment.file)
      ? await readFileAsAttachment(attachment.file)
      : ({ ok: false, reason: i18n.t("attachments.missing") } as const);

    if (!result.ok) {
      throw new Error(result.reason);
    }

    const { dataUrl, content, name, type } = result.attachment;
    const isImage = result.attachment.isImage || dataUrl?.startsWith("data:image/");

    return {
      ...attachment,
      status: { type: "complete" },
      content: isImage
        ? [{ type: "image", image: dataUrl ?? "" }]
        : [{ type: "file", data: dataUrl || content || "", mimeType: type, filename: name }],
    };
  },
};
