import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'

import { clearAccessToken, getAccessToken } from '@/shared/auth/token'

/**
 * 身份验证状态类型
 */
type AuthState = {
  /** 访问令牌 */
  accessToken: string | null
}

/**
 * 身份验证上下文值类型
 */
type AuthContextValue = {
  /** 当前验证状态 */
  state: AuthState
  /** 从本地存储刷新令牌状态 */
  refreshFromStorage: () => void
  /** 退出登录并清除令牌 */
  logout: () => void
}
// 身份验证上下文
const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * 身份验证提供者组件
 * 负责管理和提供全局的身份验证状态
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    accessToken: getAccessToken(),
  }))

  /**
   * 从存储中同步最新的令牌到状态中
   */
  const refreshFromStorage = useCallback(() => {
    setState({
      accessToken: getAccessToken(),
    })
  }, [])

  /**
   * 退出登录：清除本地存储的令牌并重置状态
   */
  const logout = useCallback(() => {
    clearAccessToken()
    refreshFromStorage()
  }, [refreshFromStorage])

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      refreshFromStorage,
      logout,
    }),
    [state, refreshFromStorage, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * 获取身份验证上下文的 Hook
 * @throws {Error} 如果在 AuthProvider 之外使用则抛出异常
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}
