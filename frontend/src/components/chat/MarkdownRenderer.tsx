import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import * as React from "react";
import { Streamdown } from "streamdown";

import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MARKDOWN_PLUGINS = { code, math };

/** 正文/预览共用的排版类名，改这里两边一起变 */
export const MARKDOWN_PROSE_CLASSES = [
  // `prose` 排版依赖 @tailwindcss/typography，已在 global.css 通过 @plugin 启用
  "prose prose-sm dark:prose-invert text-foreground max-w-none font-sans leading-relaxed wrap-break-word selection:bg-primary/20",
  "prose-p:my-2.5 prose-p:leading-relaxed",
  "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground",
  // 用 em 而非固定 rem，标题才会跟随「字号」设置一起缩放
  "prose-h1:text-[1.5em] prose-h2:text-[1.25em] prose-h3:text-[1.125em]",
  "prose-ul:my-2 prose-ul:list-disc prose-ul:ps-5",
  "prose-ol:my-2 prose-ol:list-decimal prose-ol:ps-5",
  "prose-li:my-0.5",
  "prose-blockquote:border-l-2 prose-blockquote:border-primary/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground",
];

/** 外链在新窗口打开；Streamdown 默认渲染器不带 target */
const COMPONENTS = {
  a: (props: React.ComponentProps<"a">) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary font-medium underline underline-offset-4 hover:opacity-80"
      {...props}
    />
  ),
};

/**
 * Markdown 渲染（Streamdown）。
 *
 * 代码高亮、KaTeX、表格与复制控件都由 Streamdown 自带，不再自己拼 remark/rehype 插件链。
 */
function MarkdownRendererBase({ content, className }: MarkdownRendererProps) {
  return (
    <div style={{ fontSize: "var(--chat-font-size)" }}>
      <Streamdown
        mode="static"
        className={cn(MARKDOWN_PROSE_CLASSES, className)}
        plugins={MARKDOWN_PLUGINS}
        components={COMPONENTS}
        lineNumbers
        controls={{ code: true, table: true }}
        linkSafety={{ enabled: false }}
      >
        {content}
      </Streamdown>
    </div>
  );
}

/**
 * `memo` 让内容未变的消息跳过整棵解析树重建，
 * 这是长对话流式场景下的主要性能屏障。
 */
export const MarkdownRenderer = React.memo(MarkdownRendererBase);
MarkdownRenderer.displayName = "MarkdownRenderer";
