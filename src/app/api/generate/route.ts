import { NextRequest, NextResponse } from 'next/server'
import type { GenerateRequest, GenerateResponse, Config } from '@/types'

// 扩展配置接口以包含API配置
interface FullConfig extends Config {
  apiKey: string
  selectedModel: string
}

// 构建 AI prompt
const buildPrompt = (keywords: string[], config: Config): string => {
  const enabledRules = config.generationRules
    .filter(rule => rule.enabled)
    .map(rule => `- ${rule.description}`)
    .join('\n')

  const customRules = config.customRules && config.customRules.length > 0
    ? config.customRules.map(rule => `- ${rule}`).join('\n')
    : ''

  const allRules = [enabledRules, customRules].filter(Boolean).join('\n')
  
  const baseTags = config.baseTags 
    ? config.baseTags.split(' ').filter(tag => tag.trim()).join(', ')
    : ''

  return `你是一个专业的内容创作助手。请根据以下信息生成相应的标题和标签。

背景信息: ${config.backgroundInfo}
输出语言: ${config.outputLanguage === 'chinese' ? '中文' : config.outputLanguage}
${baseTags ? `基础标签: ${baseTags}` : '基础标签: 无特定基础标签'}

生成规则:
${allRules}

关键词: ${keywords.join(', ')}

请根据以上信息生成:
1. 5-10个吸引人的标题
2. 10-15个相关的标签（不要包含#号，只要标签词）

请严格按照以下JSON格式返回结果，不要包含任何其他文字说明:
{
  "titles": ["标题1", "标题2", "标题3"],
  "tags": ["标签1", "标签2", "标签3"]
}`
}

// 验证 API Key 格式
const isValidApiKey = (apiKey: string): boolean => {
  return apiKey.length > 10 && apiKey.startsWith('sk-')
}

// 调用 aihubmix API
const callAIHubMixAPI = async (prompt: string, apiKey: string, config: FullConfig) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

  try {
    const response = await fetch('https://api.aihubmix.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.selectedModel || 'gemini-2.0-flash-lite',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      let errorData: any = {}
      
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: { message: errorText || `HTTP ${response.status}` } }
      }
      
      const statusMessages: Record<number, string> = {
        401: 'API Key 无效或已过期',
        403: 'API 访问被拒绝，请检查权限',
        429: '请求频率过高，请稍后重试',
        500: 'AI 服务暂时不可用',
        502: '网关错误，请稍后重试',
        503: '服务暂时不可用',
        504: '请求超时，请稍后重试'
      }
      
      const errorMessage = errorData.error?.message || 
                          statusMessages[response.status] || 
                          `API 请求失败: ${response.status}`
      
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请稍后重试')
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch failed')) {
        throw new Error('网络连接失败，请检查网络连接')
      }
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        throw new Error('无法连接到AI服务，请稍后重试')
      }
    }
    
    console.error('API call error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })
    
    throw error
  }
}

// 解析 AI 响应
const parseAIResponse = (content: string): { titles: string[], tags: string[] } => {
  try {
    // 尝试清理markdown格式并解析 JSON
    let cleanContent = content.trim()
    
    // 移除markdown代码块标记
    cleanContent = cleanContent.replace(/^```json\s*/gm, '')
    cleanContent = cleanContent.replace(/^```\s*/gm, '')
    cleanContent = cleanContent.replace(/```$/gm, '')
    
    // 尝试找到JSON对象
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleanContent = jsonMatch[0]
    }
    
    // 尝试解析清理后的内容
    const parsed = JSON.parse(cleanContent)
    if (parsed.titles && parsed.tags) {
      return {
        titles: Array.isArray(parsed.titles) ? parsed.titles : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      }
    }
  } catch (error) {
    console.error('JSON parse error:', error)
  }

  // 如果 JSON 解析失败，尝试正则表达式提取
  const titleMatch = content.match(/"titles":\s*\[(.*?)\]/s)
  const tagMatch = content.match(/"tags":\s*\[(.*?)\]/s)

  const titles: string[] = []
  const tags: string[] = []

  if (titleMatch) {
    try {
      const titleArray = JSON.parse(`[${titleMatch[1]}]`)
      titles.push(...titleArray)
    } catch (error) {
      console.error('Title parse error:', error)
    }
  }

  if (tagMatch) {
    try {
      const tagArray = JSON.parse(`[${tagMatch[1]}]`)
      tags.push(...tagArray)
    } catch (error) {
      console.error('Tag parse error:', error)
    }
  }

  return { titles, tags }
}

export async function POST(request: NextRequest) {
  try {
    // 添加请求体大小检查
    const contentLength = request.headers.get('content-length')
    if (contentLength && Number.parseInt(contentLength, 10) > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { success: false, error: '请求数据过大' },
        { status: 413 }
      )
    }

    let body: GenerateRequest
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '请求格式错误' },
        { status: 400 }
      )
    }

    const { keywords, config } = body
    
    // 将配置转换为完整配置（包含API配置）
    const fullConfig = config as FullConfig

    // 详细的输入验证
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: '关键词不能为空' },
        { status: 400 }
      )
    }

    if (keywords.length > 50) {
      return NextResponse.json(
        { success: false, error: '关键词数量不能超过50个' },
        { status: 400 }
      )
    }

    // 检查关键词长度
    const invalidKeywords = keywords.filter(k => !k || typeof k !== 'string' || k.trim().length === 0 || k.length > 100)
    if (invalidKeywords.length > 0) {
      return NextResponse.json(
        { success: false, error: '关键词格式无效或过长' },
        { status: 400 }
      )
    }

    if (!fullConfig || typeof fullConfig !== 'object') {
      return NextResponse.json(
        { success: false, error: '配置信息不能为空' },
        { status: 400 }
      )
    }

    if (!fullConfig.apiKey || typeof fullConfig.apiKey !== 'string') {
      return NextResponse.json(
        { success: false, error: 'API Key 不能为空' },
        { status: 400 }
      )
    }

    if (!isValidApiKey(fullConfig.apiKey)) {
      return NextResponse.json(
        { success: false, error: 'API Key 格式无效' },
        { status: 400 }
      )
    }

    // 构建 prompt
    const prompt = buildPrompt(keywords, fullConfig)
    
    // 检查prompt长度
    if (prompt.length > 50000) {
      return NextResponse.json(
        { success: false, error: '生成内容过长，请减少关键词或简化配置' },
        { status: 400 }
      )
    }

    // 调用 AI API
    const aiResponse = await callAIHubMixAPI(prompt, fullConfig.apiKey, fullConfig)

    if (!aiResponse || typeof aiResponse !== 'object') {
      throw new Error('AI 服务响应格式错误')
    }

    if (!aiResponse.choices || !Array.isArray(aiResponse.choices) || aiResponse.choices.length === 0) {
      throw new Error('AI 响应中没有生成内容')
    }

    const choice = aiResponse.choices[0]
    if (!choice || !choice.message || typeof choice.message.content !== 'string') {
      throw new Error('AI 响应内容格式错误')
    }

    const content = choice.message.content
    const { titles, tags } = parseAIResponse(content)

    // 验证解析结果
    if (!Array.isArray(titles) || !Array.isArray(tags)) {
      throw new Error('AI 生成内容解析失败')
    }

    if (titles.length === 0 && tags.length === 0) {
      throw new Error('AI 未能生成有效内容，请尝试调整关键词')
    }

    const response: GenerateResponse = {
      success: true,
      data: {
        titles: titles.slice(0, 20), // 限制数量
        tags: tags.slice(0, 50),     // 限制数量
      },
      usage: {
        tokensUsed: aiResponse.usage?.total_tokens || 0,
        requestId: aiResponse.id || '',
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Generation API error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
    })
    
    let errorMessage = '生成失败，请稍后重试'
    let statusCode = 500

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      
      if (message.includes('api key') || message.includes('unauthorized') || message.includes('invalid key')) {
        errorMessage = 'API Key 无效或已过期'
        statusCode = 401
      } else if (message.includes('quota') || message.includes('billing')) {
        errorMessage = 'API 配额已用完'
        statusCode = 402
      } else if (message.includes('rate limit') || message.includes('too many requests')) {
        errorMessage = '请求频率过高，请稍后重试'
        statusCode = 429
      } else if (message.includes('timeout') || message.includes('超时')) {
        errorMessage = '请求超时，请稍后重试'
        statusCode = 408
      } else if (message.includes('network') || message.includes('连接') || message.includes('fetch failed')) {
        errorMessage = '网络连接失败，请稍后重试'
        statusCode = 503
      } else if (message.includes('parse') || message.includes('解析')) {
        errorMessage = 'AI 响应解析失败，请重试'
        statusCode = 422
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    )
  }
}

// 健康检查端点
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
