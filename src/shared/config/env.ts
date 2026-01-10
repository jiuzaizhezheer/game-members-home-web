export function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL
  if (typeof url === 'string' && url.trim().length > 0) return url.trim()
  return '/api'
}

