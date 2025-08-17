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
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API call error:', error)
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
    const body: GenerateRequest = await request.json()
    const { keywords, config } = body
    
    // 将配置转换为完整配置（包含API配置）
    const fullConfig = config as FullConfig

    // 验证输入
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: '关键词不能为空' },
        { status: 400 }
      )
    }

    if (!fullConfig || !fullConfig.apiKey) {
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

    // 调用 AI API
    const aiResponse = await callAIHubMixAPI(prompt, fullConfig.apiKey, fullConfig)

    if (!aiResponse.choices || aiResponse.choices.length === 0) {
      throw new Error('AI 响应格式错误')
    }

    const content = aiResponse.choices[0].message.content
    const { titles, tags } = parseAIResponse(content)

    const response: GenerateResponse = {
      success: true,
      data: {
        titles,
        tags,
      },
      usage: {
        tokensUsed: aiResponse.usage?.total_tokens || 0,
        requestId: aiResponse.id || '',
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Generation API error:', error)
    
    let errorMessage = '生成失败，请稍后重试'
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'API Key 无效或已过期'
      } else if (error.message.includes('quota')) {
        errorMessage = 'API 配额已用完'
      } else if (error.message.includes('rate limit')) {
        errorMessage = '请求频率过高，请稍后重试'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// 健康检查端点
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
