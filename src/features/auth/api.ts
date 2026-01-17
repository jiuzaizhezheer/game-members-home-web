import { requestJson } from '@/shared/api/http'
import type { AuthLoginIn, AuthRegisterIn, AccessTokenOut, CaptchaOut } from '@/features/auth/types'

export const authApi = {
  /**
   * 获取验证码
   */
  async getCaptcha(): Promise<CaptchaOut> {
    return await requestJson<CaptchaOut>('/auths/captcha', {
      method: 'GET',
      auth: false,
    })
  },

  /**
   * 用户登录
   */
  async login(payload: AuthLoginIn): Promise<AccessTokenOut> {
    return await requestJson<AccessTokenOut>('/auths/login', {
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
