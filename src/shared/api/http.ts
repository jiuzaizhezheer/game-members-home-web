import { toast } from 'sonner'
import { getAccessToken, setAccessToken, clearAccessToken } from '@/shared/auth/token'
import { getApiBaseUrl } from '@/shared/config/env'

// API 基础地址（模块加载时初始化一次）
const baseUrl = getApiBaseUrl()

/**
 * 刷新 Token 的 Promise（防止并发刷新）
 */
let refreshPromise: Promise<string> | null = null

/**
 * 刷新 Access Token
 * 使用 Cookie 中的 refresh_token（自动发送）
 */
async function refreshAccessToken(): Promise<string> {
  // 如果已经有刷新请求在进行中，直接返回该 Promise
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${baseUrl}/auths/refresh`, {
        method: 'POST',
        credentials: 'include', // 👈 携带 Cookie
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })

      if (!res.ok) {
        throw new Error('登录已过期，请重新登录')
      }

      const payload = await res.json()
      const newAccessToken = payload.data?.access_token

      if (!newAccessToken) {
        throw new Error('无效的令牌响应')
      }

      // 更新内存中的 access_token
      setAccessToken(newAccessToken)
      return newAccessToken
    } catch (error) {
      // 刷新失败，清除 Token 并抛出错误
      clearAccessToken()
      // 这里可以选择是否强制跳转登录页，通常交给 RouterGuard 处理，但如果不处理会很奇怪
      if (window.location.pathname !== '/login') {
        // 可选：toast.error('登录已过期，请重新登录')
        // window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      }
      throw error
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

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
  /** 内部使用：是否是重试请求 */
  _retry?: boolean
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
    // 尝试获取 access_token
    let token = getAccessToken()

    // 如果内存中没有 token 且是首次请求（非登录/注册接口），尝试刷新一次
    // 这种情况常发生在页面刷新后，内存被清空，但 Cookie 还在
    if (!token && !path.includes('/login') && !path.includes('/register') && !options._retry) {
      try {
        token = await refreshAccessToken()
      } catch {
        // 忽略刷新失败，继续请求（将会收到 401）
      }
    }

    if (token) headers.Authorization = `Bearer ${token}`
  }

  // 发送 HTTP 请求
  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: 'include', // 👈 关键：允许携带 Cookie（用于 refresh_token）
  })

  // 解析响应内容
  const contentType = res.headers.get('Content-Type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await res.json() : null

  // 🔄 处理 401 错误 - 自动刷新 Token
  if (res.status === 401 && !options._retry) {
    // 如果是登录接口本身的 401，不进行刷新
    if (path.includes('/login')) {
      // pass through to error handler
    } else {
      try {
        // 刷新 access_token
        await refreshAccessToken()

        // 重试原请求（递归调用）
        // 注意：这里不需要手动设置 header，因为 requestJson 内部会重新调用 getAccessToken()
        return requestJson<T>(path, { ...options, _retry: true })
      } catch {
        // 刷新失败，走下面的错误处理流程
      }
    }
  }

  // 处理错误响应（非 2xx 状态码）
  if (!res.ok) {
    // 优先使用后端返回的错误信息，否则使用默认错误信息
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed: ${res.status}`

    // 避免对 401 报错弹窗过于频繁（如果刷新失败的话），或者可以保留
    if (res.status !== 401 || path.includes('/login')) {
      setTimeout(() => toast.error(message), 0)
    }

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

  // 某些接口可能没有 data 字段 (如 response_model=SuccessResponse[None])
  // 这种情况下如果成功了，可以返回 payload 本身或者 undefined，视具体约定
  // 你的 SuccessResponse 包含 message, data, code，如果没有 data，通常意味着返回 null 或 undefined
  return undefined as unknown as T
}
