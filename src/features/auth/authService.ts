import type { AuthLoginIn, AuthRegisterIn } from '@/features/auth/types'
import { authApi } from '@/features/auth/api'
import { setAccessToken } from '@/shared/auth/token'

/** 认证服务 */
export const authService = {
  /** 用户登录 */
  async login(payload: AuthLoginIn): Promise<void> {
    const access_token_out = await authApi.login(payload)
    setAccessToken(access_token_out.access_token)
  },

  /** 用户注册 */
  async register(payload: AuthRegisterIn): Promise<void> {
    await authApi.register(payload)
  },
}
