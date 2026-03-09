import { NextRequest, NextResponse } from 'next/server'

// 验证 API Key 格式
const isValidApiKey = (apiKey: string): boolean => {
  return apiKey.length > 10 && apiKey.startsWith('sk-')
}

// 调用 aihubmix API
const callAIHubMixAPI = async (prompt: string, apiKey: string, model: string) => {
  try {
    const response = await fetch('https://api.aihubmix.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gemini-2.0-flash-lite',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.8,
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

// 解析 AI 响应，提取关键词联想
const parseSuggestions = (content: string, maxCount: number = 5): string[] => {
  // 需要排除的字段名
  const excludeFields = ['suggestions', 'keywords', 'titles', 'tags', 'words', 'results']

  try {
    let cleanContent = String(content).trim()

    // 移除markdown代码块标记
    cleanContent = cleanContent.replace(/^```json\s*/gm, '')
    cleanContent = cleanContent.replace(/^```\s*/gm, '')
    cleanContent = cleanContent.replace(/```$/gm, '')

    // 尝试找到JSON对象（包含 suggestions 字段）
    const startIdx = cleanContent.indexOf('{')
    if (startIdx !== -1) {
      // 尝试找到匹配的 }
      let braceCount = 0
      let endIdx = -1
      for (let i = startIdx; i < cleanContent.length; i++) {
        if (cleanContent[i] === '{') braceCount++
        if (cleanContent[i] === '}') {
          braceCount--
          if (braceCount === 0) {
            endIdx = i + 1
            break
          }
        }
      }
      if (endIdx !== -1) {
        const jsonStr = cleanContent.substring(startIdx, endIdx)
        const parsed = JSON.parse(jsonStr)

        // 查找联想词数组
        for (const key of Object.keys(parsed)) {
          if (excludeFields.includes(key.toLowerCase())) continue

          const value = parsed[key]
          if (Array.isArray(value)) {
            const filtered = value
              .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
              .slice(0, maxCount)
            if (filtered.length > 0) return filtered
          }
        }

        // 尝试常见的字段名
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          return parsed.suggestions
            .filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, maxCount)
        }
        if (parsed.keywords && Array.isArray(parsed.keywords)) {
          return parsed.keywords
            .filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, maxCount)
        }
      }
    }

    // 尝试找到纯数组格式 [...]
    const arrayMatch = cleanContent.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      try {
        const parsed = JSON.parse(arrayMatch[0])
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, maxCount)
        }
      } catch {
        // 数组解析失败，继续尝试其他方法
      }
    }
  } catch (error) {
    console.error('Parse error:', error)
  }

  // 最后尝试：提取双引号内的字符串，排除字段名
  const quoteArrayMatch = content.match(/"([^"]+)"\s*,?\s*/g)
  if (quoteArrayMatch) {
    const results: string[] = []
    for (const match of quoteArrayMatch) {
      const cleanMatch = match.replace(/[",\s]/g, '').trim()
      // 排除字段名
      if (cleanMatch && !excludeFields.includes(cleanMatch.toLowerCase()) && cleanMatch.length > 0) {
        results.push(cleanMatch)
      }
    }
    if (results.length > 0) {
      return results.slice(0, maxCount)
    }
  }

  return []
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyword, apiKey, model, count } = body

    // 验证并设置联想词数量
    const suggestionCount = Math.min(30, Math.max(1, parseInt(count) || 5))

    // 验证输入
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '关键词不能为空' },
        { status: 400 }
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key 不能为空' },
        { status: 400 }
      )
    }

    if (!isValidApiKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: 'API Key 格式无效' },
        { status: 400 }
      )
    }

    // 构建联想 prompt
    const prompt = `你是一个关键词联想助手。请根据输入的关键词联想出${suggestionCount}个与之相关的关键词。

输入的关键词: ${keyword.trim()}

请根据以下类别联想相关关键词：
1. 同义词
2. 相关领域
3. 常见搭配
4. 下位概念
5. 上位概念

请严格按照以下JSON格式返回结果，不要包含任何其他文字说明:
{
  "keywords": ["关键词1", "关键词2", "关键词3"]
}`

    // 调用 AI API
    const aiResponse = await callAIHubMixAPI(prompt, apiKey, model || 'gemini-2.0-flash-lite')

    if (!aiResponse.choices || aiResponse.choices.length === 0) {
      throw new Error('AI 响应格式错误')
    }

    const firstChoice = (aiResponse as any).choices?.[0]
    const rawContent = firstChoice?.message?.content ?? firstChoice?.text ?? ''
    const content = Array.isArray(rawContent)
      ? rawContent.map((x: unknown) => typeof x === 'string' ? x : (x as any)?.text ?? '').join('\n')
      : String(rawContent ?? '')

    const suggestions = parseSuggestions(content, suggestionCount)

    return NextResponse.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 10),
      },
    })
  } catch (error) {
    console.error('Keyword Suggest API error:', error)

    let errorMessage = '联想失败，请稍后重试'
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
