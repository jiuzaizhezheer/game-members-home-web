import { getApiBaseUrl } from '@/shared/config/env'

/**
 * 将相对路径转换为完整的静态文件访问 URL
 * @param path 相对路径或绝对路径
 */
export function getFileUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http')) return path

  const baseUrl = getApiBaseUrl()
  let rootUrl = ''

  if (baseUrl.startsWith('http')) {
    // 如果是完整 URL，去掉末尾的 /api 或 /api/
    rootUrl = baseUrl.replace(/\/api\/?$/, '')
  } else {
    // 如果是相对路径 (如 /api)，则尝试推断后端端口（开发环境下通常是 8000）
    // 或者在生产环境下，如果前后端同域，可以保持相对路径
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      rootUrl = 'http://localhost:8000'
    }
  }

  // 确保 path 以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${rootUrl}${normalizedPath}`
}
