export type ModelProvider = "openrouter" | "deepseek" | "openai" | "custom";
export type ModelCategory = "openrouter-free" | "deepseek" | "openrouter-flagship" | "custom";

export interface AIModel {
  id: string;
  name: string;
  /** 描述文案的 i18n key，渲染时再取 */
  descriptionKey: string;
  provider: ModelProvider;
  category: ModelCategory;
  supportsThinking?: boolean;
  supportsVision?: boolean;
  maxThinkingBudget?: number;
  badge?: string;
  contextWindow?: string;
  pricing?: string;
}

export const AVAILABLE_MODELS: AIModel[] = [
  // 1. OpenRouter 流行免费模型 (Zero Cost / Free Endpoints)
  {
    id: "openrouter/free",
    descriptionKey: "settings.models.descriptions.openrouter_free",
    name: "OpenRouter Free Router",
    provider: "openrouter",
    category: "openrouter-free",
    supportsThinking: false,
    supportsVision: true,
    badge: "Auto Free",
    contextWindow: "128K",
    pricing: "Free",
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    descriptionKey: "settings.models.descriptions.google_gemini_2_0_flash_exp_free",
    name: "Gemini 2.0 Flash (Free)",
    provider: "openrouter",
    category: "openrouter-free",
    supportsThinking: false,
    supportsVision: true,
    badge: "Free Flash",
    contextWindow: "1M",
    pricing: "Free",
  },
  {
    id: "meta-llama/llama-3.2-11b-vision-instruct:free",
    descriptionKey: "settings.models.descriptions.meta_llama_llama_3_2_11b_vision_instruct_free",
    name: "Llama 3.2 11B Vision (Free)",
    provider: "openrouter",
    category: "openrouter-free",
    supportsThinking: false,
    supportsVision: true,
    badge: "Free Vision",
    contextWindow: "128K",
    pricing: "Free",
  },
  {
    id: "deepseek/deepseek-r1:free",
    descriptionKey: "settings.models.descriptions.deepseek_deepseek_r1_free",
    name: "DeepSeek R1 (Free)",
    provider: "openrouter",
    category: "openrouter-free",
    supportsThinking: true,
    supportsVision: false,
    badge: "Free R1",
    contextWindow: "64K",
    pricing: "Free",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    descriptionKey: "settings.models.descriptions.meta_llama_llama_3_3_70b_instruct_free",
    name: "Llama 3.3 70B Instruct (Free)",
    provider: "openrouter",
    category: "openrouter-free",
    supportsThinking: false,
    supportsVision: false,
    badge: "Free 70B",
    contextWindow: "128K",
    pricing: "Free",
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct:free",
    descriptionKey: "settings.models.descriptions.qwen_qwen_2_5_coder_32b_instruct_free",
    name: "Qwen 2.5 Coder 32B (Free)",
    provider: "openrouter",
    category: "openrouter-free",
    supportsThinking: false,
    supportsVision: false,
    badge: "Free Code",
    contextWindow: "32K",
    pricing: "Free",
  },

  // 2. DeepSeek 官方最新模型 (https://api-docs.deepseek.com/zh-cn/quick_start/pricing)
  {
    id: "deepseek-flash",
    descriptionKey: "settings.models.descriptions.deepseek_flash",
    name: "DeepSeek-V4.1 Flash (Direct)",
    provider: "deepseek",
    category: "deepseek",
    supportsThinking: true,
    supportsVision: true,
    badge: "New Flash 1M",
    contextWindow: "1M",
    pricing: "In ¥0.15/1M  (hit ¥0.003) · Out ¥0.60/1M",
  },
  {
    id: "deepseek-v4-pro",
    descriptionKey: "settings.models.descriptions.deepseek_v4_pro",
    name: "DeepSeek-V4 Pro (Direct)",
    provider: "deepseek",
    category: "deepseek",
    supportsThinking: true,
    supportsVision: true,
    badge: "New Pro 1M",
    contextWindow: "1M",
    pricing: "In ¥0.66/1M  (hit ¥0.022) · Out ¥1.98/1M",
  },

  // 3. OpenRouter 旗舰付费模型 (Flagship)
  {
    id: "anthropic/claude-3.7-sonnet",
    descriptionKey: "settings.models.descriptions.anthropic_claude_3_7_sonnet",
    name: "Claude 3.7 Sonnet (OpenRouter)",
    provider: "openrouter",
    category: "openrouter-flagship",
    supportsThinking: true,
    supportsVision: true,
    maxThinkingBudget: 64000,
    badge: "Recommended",
    contextWindow: "200K",
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    descriptionKey: "settings.models.descriptions.anthropic_claude_3_5_sonnet",
    name: "Claude 3.5 Sonnet (OpenRouter)",
    provider: "openrouter",
    category: "openrouter-flagship",
    supportsThinking: false,
    supportsVision: true,
    badge: "Popular",
    contextWindow: "200K",
  },
  {
    id: "anthropic/claude-3.5-haiku",
    descriptionKey: "settings.models.descriptions.anthropic_claude_3_5_haiku",
    name: "Claude 3.5 Haiku (OpenRouter)",
    provider: "openrouter",
    category: "openrouter-flagship",
    supportsThinking: false,
    supportsVision: true,
    contextWindow: "200K",
  },
  {
    id: "openai/gpt-4o",
    descriptionKey: "settings.models.descriptions.openai_gpt_4o",
    name: "GPT-4o (OpenRouter)",
    provider: "openrouter",
    category: "openrouter-flagship",
    supportsThinking: false,
    supportsVision: true,
    badge: "GPT-4o",
    contextWindow: "128K",
  },
  {
    id: "openai/o3-mini",
    descriptionKey: "settings.models.descriptions.openai_o3_mini",
    name: "o3-mini (OpenRouter)",
    provider: "openrouter",
    category: "openrouter-flagship",
    supportsThinking: true,
    supportsVision: false,
    badge: "Reasoning",
    contextWindow: "128K",
  },
];

export interface WebSource {
  title: string;
  url: string;
  snippet?: string;
  icon?: string;
}

export interface ArtifactVersion {
  version: number;
  content: string;
  timestamp: number;
}

export type ArtifactType = "code" | "html" | "react" | "svg" | "mermaid" | "markdown";

export interface ArtifactItem {
  id: string;
  messageId?: string;
  title: string;
  type: ArtifactType;
  language: string;
  content: string;
  versions: ArtifactVersion[];
  currentVersion: number;
  createdAt: number;
}

export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  dataUrl?: string;
  content?: string;
  isImage?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  thinking?: string;
  thinkingDuration?: number;
  sources?: WebSource[];
  attachments?: ChatAttachment[];
  modelId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  projectId?: string;
}
