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
 * API 请求接口
 */
export interface GenerateRequest {
  keywords: string[]
  config: Config
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
  { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite', description: '轻量快速，推荐使用' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', description: '平衡性能与速度' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', description: '最新版本轻量模型' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: '快速、经济的选择' },
  { value: 'gpt-4', label: 'GPT-4', description: '更强大的理解和创作能力' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: '速度和性能的平衡' },
  { value: 'claude-3-sonnet', label: 'Claude-3 Sonnet', description: '高质量的文本生成' },
  { value: 'claude-3-haiku', label: 'Claude-3 Haiku', description: '快速响应' },
] as const

export type AIModel = typeof AI_MODELS[number]['value']

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
]
