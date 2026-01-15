import { toast } from 'sonner'
import { getAccessToken } from '@/shared/auth/token'
import { getApiBaseUrl } from '@/shared/config/env'

// API 基础地址（模块加载时初始化一次）
const baseUrl = getApiBaseUrl()

/**
 * 请求配置选项
 */
export type RequestJsonOptions = {
  /** HTTP 请求方法，默认为 'GET' */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** 请求体数据，会自动序列化为 JSON */
  body?: unknown
  /** 是否携带认证令牌，默认为 true */
  auth?: boolean
  /**
   * 是否显示成功提示。
   * 默认逻辑：POST/PUT/PATCH/DELETE 请求会自动显示后端返回的 message。
   * 如果显式传入 true/false，则覆盖默认逻辑。
   */
  showSuccess?: boolean
}

/**
 * 通用 JSON 请求函数
 * 封装 fetch API，提供统一的请求处理逻辑
 */
export async function requestJson<T>(path: string, options: RequestJsonOptions = {}): Promise<T> {
  // 拼接完整 URL
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`

  // 初始化请求头，默认接受 JSON 响应
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  // 如果有请求体，设置 Content-Type 为 JSON
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  // 默认携带认证令牌（除非显式设置 auth: false）
  if (options.auth !== false) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  // 发送 HTTP 请求
  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  // 解析响应内容
  const contentType = res.headers.get('Content-Type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await res.json() : null

  // 处理错误响应（非 2xx 状态码）
  if (!res.ok) {
    // 优先使用后端返回的错误信息，否则使用默认错误信息
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed: ${res.status}`

    // 弹窗提示错误信息
    setTimeout(() => toast.error(message), 0)
    // 💡 添加这一行，可以在浏览器控制台看到完整的调试信息
    console.error(`[API Error] ${options.method || 'GET'} ${path}:`, {
      status: res.status,
      payload,
    })

    throw new Error(message)
  }

  // 统一处理成功消息弹窗
  const { method = 'GET', showSuccess } = options
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)

  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message: string }).message
    // 如果 message 存在，且符合显示条件（显式开启 或 默认开启 Mutation 请求）
    if (message && (showSuccess === true || (isMutation && showSuccess !== false))) {
      setTimeout(() => toast.success(message), 0)
    }
  }

  // 如果 payload 存在且包含 data 属性，直接返回 data
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }

  throw new Error('Invalid response format')
}
