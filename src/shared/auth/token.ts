// 将 Access Token 存储在内存中
let accessToken: string | null = null

// 设置 Access Token
export function setAccessToken(token: string): void {
  accessToken = token
}

// 获取 Access Token
export function getAccessToken(): string | null {
  return accessToken
}

// 清理 Access Token 
export function clearAccessToken(): void {
  accessToken = null
}

/**Refresh Token 使用 HttpOnly Cookie 管理，JS 无法获取 */
