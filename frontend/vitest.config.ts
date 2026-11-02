import path from "node:path";

import { defineConfig } from "vitest/config";

/**
 * 与 `vite.config.ts` 分离：跑测试不需要 react / tailwind 插件。
 * 加组件测试时用 `test.projects` 拆出 jsdom 环境即可。
 */
export default defineConfig({
  // 与 vite.config.ts 保持同一份 alias（`@/` → `src/`）
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
