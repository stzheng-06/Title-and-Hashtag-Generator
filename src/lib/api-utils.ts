/**
 * API utilities for better error handling and debugging
 */

export interface APIErrorInfo {
  message: string
  code?: string
  statusCode?: number
  retryable: boolean
  userFriendly: string
}

/**
 * 分析错误并提供用户友好的消息
 */
export function analyzeAPIError(error: unknown): APIErrorInfo {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    // 网络相关错误
    if (message.includes('failed to fetch') || message.includes('fetch failed')) {
      return {
        message: error.message,
        code: 'NETWORK_ERROR',
        retryable: true,
        userFriendly: '网络连接失败，请检查网络状态后重试'
      }
    }
    
    // 超时错误
    if (message.includes('timeout') || message.includes('aborted')) {
      return {
        message: error.message,
        code: 'TIMEOUT',
        retryable: true,
        userFriendly: '请求超时，请稍后重试'
      }
    }
    
    // API Key 相关错误
    if (message.includes('api key') || message.includes('unauthorized')) {
      return {
        message: error.message,
        code: 'AUTH_ERROR',
        retryable: false,
        userFriendly: 'API Key 无效或已过期，请检查配置'
      }
    }
    
    // 配额相关错误
    if (message.includes('quota') || message.includes('billing')) {
      return {
        message: error.message,
        code: 'QUOTA_ERROR',
        retryable: false,
        userFriendly: 'API 配额已用完，请检查账户余额'
      }
    }
    
    // 频率限制错误
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return {
        message: error.message,
        code: 'RATE_LIMIT',
        retryable: true,
        userFriendly: '请求频率过高，请等待一分钟后重试'
      }
    }
    
    // 解析错误
    if (message.includes('json') || message.includes('parse')) {
      return {
        message: error.message,
        code: 'PARSE_ERROR',
        retryable: true,
        userFriendly: '服务器响应格式错误，请重试'
      }
    }
  }
  
  // 默认错误
  return {
    message: error instanceof Error ? error.message : String(error),
    code: 'UNKNOWN_ERROR',
    retryable: true,
    userFriendly: '生成失败，请稍后重试'
  }
}

/**
 * 检查环境是否为生产环境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * 检查是否在 Vercel 环境中
 */
export function isVercelDeployment(): boolean {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV)
}

/**
 * 获取环境信息用于调试
 */
export function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    isVercel: isVercelDeployment(),
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString(),
  }
}

/**
 * 创建带有重试逻辑的 fetch 函数
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      // 如果是客户端错误（4xx），不重试
      if (response.status >= 400 && response.status < 500) {
        return response
      }
      
      // 如果是成功或服务器错误但非最后一次尝试，返回响应
      if (response.ok || attempt === maxRetries) {
        return response
      }
      
      // 服务器错误，准备重试
      throw new Error(`Server error: ${response.status}`)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // 等待后重试
      const delay = baseDelay * (2 ** attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError || new Error('Max retries exceeded')
}
