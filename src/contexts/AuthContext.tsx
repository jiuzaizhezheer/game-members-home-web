import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'

import { clearTokens, getAccessToken, getRefreshToken } from '@/shared/auth/token'

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
}

type AuthContextValue = {
  state: AuthState
  refreshFromStorage: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  }))

  const refreshFromStorage = useCallback(() => {
    setState({
      accessToken: getAccessToken(),
      refreshToken: getRefreshToken(),
    })
  }, [])

  const logout = useCallback(() => {
    clearTokens()
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}

