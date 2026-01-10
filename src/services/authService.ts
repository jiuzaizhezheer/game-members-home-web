import type { LoginRequest } from '@/features/auth/types'
import { authApi } from '@/features/auth/api'
import { setAccessToken, setRefreshToken } from '@/shared/auth/token'

export const authService = {
  async login(payload: LoginRequest): Promise<void> {
    const tokens = await authApi.login(payload)
    setAccessToken(tokens.access_token)
    setRefreshToken(tokens.refresh_token)
  },
}

