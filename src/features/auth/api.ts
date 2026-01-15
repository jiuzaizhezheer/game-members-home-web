import { requestJson } from '@/shared/api/http'
import type { AuthLoginIn } from '@/features/auth/types'
import type { TokenOut } from '@/features/common/types'
import type { AuthRegisterIn } from '@/features/auth/types'

export const authApi = {
  /**
   * 用户登录
   */
  async login(payload: AuthLoginIn): Promise<TokenOut> {
    return await requestJson<TokenOut>('/auths/login', {
      method: 'POST',
      body: payload,
      auth: false,
    })
  },

  /**
   * 用户注册
   */
  async register(payload: AuthRegisterIn): Promise<void> {
    await requestJson<void>('/auths/register', {
      method: 'POST',
      body: payload,
      auth: false,
    })
  },
}
