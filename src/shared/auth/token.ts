const ACCESS_TOKEN_KEY = 'gmhw.access_token'
const REFRESH_TOKEN_KEY = 'gmhw.refresh_token'

// 访问令牌相关
export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

// 刷新令牌相关
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// 清除所有令牌
export function clearTokens(): void {
  clearAccessToken()
  clearRefreshToken()
}

