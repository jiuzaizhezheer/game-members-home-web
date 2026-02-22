import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { clearAccessToken } from '@/shared/auth/token'
import { userApi } from '@/features/user/api'
import { authApi } from '@/features/auth/api'

/**
 * 用户信息类型
 */
type UserInfo = {
  id: string
  username: string
  role: string
  avatar_url: string | null
}

/**
 * 身份验证状态类型
 */
type AuthState = {
  /* 用户信息 */
  user: UserInfo | null
  /* 是否已认证 */
  isAuthenticated: boolean
  /** 是否正在初始化（尝试恢复登录状态） */
  isInitializing: boolean
}

/**
 * 身份验证上下文值类型
 */
type AuthContextValue = {
  /** 当前验证状态 */
  state: AuthState
  /** 登录成功后刷新用户状态 */
  refreshFromStorage: () => Promise<void>
  /** 退出登录并清除令牌 */
  logout: () => Promise<void>
  /** 手动更新当前缓存的用户信息 */
  updateUser: (user: Partial<UserInfo>) => void
}
// 身份验证上下文
const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * 获取用户信息并更新状态
 */
async function fetchUserAndSetState(
  setState: React.Dispatch<React.SetStateAction<AuthState>>,
): Promise<void> {
  try {
    const profile = await userApi.getMe()
    setState({
      user: {
        id: profile.id,
        username: profile.username,
        role: profile.role,
        avatar_url: profile.avatar_url,
      },
      isAuthenticated: true,
      isInitializing: false,
    })
  } catch {
    // 获取失败 (非401)，只需结束初始化状态
    // 如果之前已登录，保持登录状态；如果之前未登录，保持未登录状态
    // 如果是 401，http.ts 会发 auth:logout 事件，那里会负责清除状态
    setState((prev) => ({ ...prev, isInitializing: false }))
  }
}

/**
 * 身份验证提供者组件
 * 负责管理和提供全局的身份验证状态
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isInitializing: true, // 初始时总是需要验证
  })

  /**
   * 页面加载时尝试恢复登录状态
   */
  useEffect(() => {
    fetchUserAndSetState(setState)
  }, [])

  /**
   * 监听 http.ts 中 refresh 失败时发出的登出事件
   */
  useEffect(() => {
    const handleForceLogout = () => {
      setState({
        user: null,
        isAuthenticated: false,
        isInitializing: false,
      })
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  /**
   * 登录成功后刷新用户状态
   */
  const refreshFromStorage = useCallback(async () => {
    await fetchUserAndSetState(setState)
  }, [])

  /**
   * 退出登录：清除本地存储的令牌并重置状态
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearAccessToken()
      setState({
        user: null,
        isAuthenticated: false,
        isInitializing: false,
      })
    }
  }, [])

  /**
   * 手动更新用户信息（用于个人资料修改后立即同步 UI）
   */
  const updateUser = useCallback((updatedFields: Partial<UserInfo>) => {
    setState((prev) => {
      if (!prev.user) return prev
      return {
        ...prev,
        user: {
          ...prev.user,
          ...updatedFields,
        },
      }
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      refreshFromStorage,
      logout,
      updateUser,
    }),
    [state, refreshFromStorage, logout, updateUser],
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
