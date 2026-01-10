import { getAccessToken } from '@/shared/auth/token'
import { getApiBaseUrl } from '@/shared/config/env'

export type RequestJsonOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
}

export async function requestJson<T>(
  path: string,
  options: RequestJsonOptions = {},
): Promise<T> {
  const baseUrl = getApiBaseUrl()
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (options.auth !== false) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const contentType = res.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await res.json() : null

  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed: ${res.status}`
    throw new Error(message)
  }

  return payload as T
}

