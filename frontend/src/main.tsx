import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { migrateLegacyChat } from "./lib/chat/migrate-legacy-chat";
import { reportCapabilityFailure } from "./lib/platform/env";
import { scrubLegacySecrets } from "./lib/store/persist-utils";
import "./i18n";
import { hydrateApiKeys, useSettingsStore, SETTINGS_PERSIST_KEY } from "./lib/store/settings-store";

// global.css 由 shadcn 生成，统一从自有入口 styles/index.css 引入，避免应用级指令被覆盖
import "streamdown/styles.css";
import "katex/dist/katex.min.css";
import "./styles/index.css";
import "./styles/chat-typography.css";
import "./styles/shell.css";

// 旧 zustand 会话 → thread 存储，幂等
migrateLegacyChat();

const container = document.getElementById("root");

/**
 * 清理 v1 遗留在 localStorage 的明文 API Key。
 *
 * zustand 的 `migrate` 只改内存对象、hydration 后不回写 storage，
 * 因此磁盘上的明文必须在这里显式重写一次，否则会一直残留到
 * 「用户某天恰好改了某个设置」才被覆盖。
 */
function scrubLegacyPersistedSecrets(): void {
  try {
    const raw = localStorage.getItem(SETTINGS_PERSIST_KEY);
    if (!raw) return;

    const scrubbed = scrubLegacySecrets(raw);
    if (scrubbed) {
      localStorage.setItem(SETTINGS_PERSIST_KEY, scrubbed);
      console.info("[bootstrap] removed legacy plaintext API keys");
    }
  } catch (error) {
    reportCapabilityFailure("bootstrap:legacy-secret-scrub", error);
  }
}

/** 语言变化时重挂载整棵树：非 hook 的 i18n.t（生成组件、类组件）也能立即刷新 */
function Root() {
  const language = useSettingsStore((state) => state.language);
  return <App key={language} />;
}

/** 挂载 React 根节点 */
function renderApp() {
  if (!container) {
    throw new Error('Root node "#root" not found');
  }

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>,
  );
}

// 顺序不可调换：先擦除磁盘明文，再从钥匙串回填密钥并渲染
scrubLegacyPersistedSecrets();

hydrateApiKeys()
  .catch((error: unknown) => {
    reportCapabilityFailure("bootstrap:hydrate-api-keys", error);
  })
  .finally(renderApp);
