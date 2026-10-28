/**
 * 生成规则接口
 */
export interface GenerationRule {
  id: string
  name: string
  description: string
  enabled: boolean
}

/**
 * 配置接口
 */
export interface Config {
  id: string
  name: string
  backgroundInfo: string
  outputLanguage: string
  baseTags: string
  generationRules: GenerationRule[]
  customRules: string[]
  customPrompt?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * 生成结果接口
 */
export interface GenerationResult {
  titles: string[]
  tags: string[]
  tokensUsed?: number
  requestId?: string
}

/**
 * 历史记录项接口
 */
export interface HistoryItem {
  id: string
  keywords: string[]
  titles: string[]
  tags: string[]
  configName: string
  model: string
  createdAt: string
}

/**
 * API 请求接口
 */
export interface GenerateRequest {
  keywords: string[]
  config: Config
  generationType?: 'titles' | 'tags'
}

/**
 * API 响应接口
 */
export interface GenerateResponse {
  success: boolean
  data?: GenerationResult
  error?: string
  usage?: {
    tokensUsed: number
    requestId: string
  }
}

/**
 * 支持的输出语言
 */
export const OUTPUT_LANGUAGES = [
  { value: 'chinese', label: '中文' },
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Español' },
  { value: 'french', label: 'Français' },
  { value: 'german', label: 'Deutsch' },
  { value: 'japanese', label: '日本語' },
  { value: 'korean', label: '한국어' },
] as const

export type OutputLanguage = typeof OUTPUT_LANGUAGES[number]['value']

/**
 * 支持的AI模型
 */
export const AI_MODELS = [
  { value: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash', description: 'deepseek-v4-flash' },
  { value: 'qwen3.8-flash', label: 'Qwen 3.8 Flash', description: 'qwen3.8-flash' },
  { value: 'gpt-5.4-mini', label: 'GPT-5.4 Mini', description: 'gpt-5.4-mini' },
  { value: 'gpt-6-luna', label: 'GPT-6 Luna', description: 'gpt-6-luna' },
  { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', description: 'gemini-3.6-flash' },
] as const

export const DEFAULT_AI_MODEL = AI_MODELS[0].value

export type AIModel = typeof AI_MODELS[number]['value']

export const resolveAIModel = (value: unknown): AIModel =>
  AI_MODELS.find(model => model.value === value)?.value ?? DEFAULT_AI_MODEL

/**
 * 预设生成规则
 */
export const DEFAULT_GENERATION_RULES: GenerationRule[] = [
  {
    id: 'no-emojis',
    name: '不使用表情符号',
    description: '生成的内容不包含任何表情符号',
    enabled: true,
  },
  {
    id: 'no-newlines',
    name: '不使用换行符',
    description: '生成的内容不包含换行符(\\n)',
    enabled: true,
  },
  {
    id: 'lowercase-tags',
    name: '标签全部小写',
    description: '所有主题标签使用小写字母',
    enabled: true,
  },
  {
    id: 'title-length-limit',
    name: '标题长度限制',
    description: '标题不超过8个字符（中文）或15个单词（英文）',
    enabled: true,
  },
  {
    id: 'tag-count-limit',
    name: '标签数量限制',
    description: '生成的标签数量限制在30个以内',
    enabled: true,
  },
  {
    id: 'no-duplicate-tags',
    name: '避免重复标签',
    description: '确保生成的标签不重复',
    enabled: true,
  },
  {
    id: 'relevant-only',
    name: '相关性要求',
    description: '只生成与关键词高度相关的内容',
    enabled: true,
  },
  {
    id: 'language-consistency',
    name: '语言一致性',
    description: '标题和标签均使用配置所指定的输出语言生成，不得混用其他语言',
    enabled: true,
  },
]
