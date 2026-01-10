import { requestJson } from '@/shared/api/http'
import type { SuccessResponse } from '@/shared/api/types'
import type { CaptchaOut, LoginRequest, TokenOut } from '@/features/auth/types'

export const authApi = {
  async getCaptcha(): Promise<CaptchaOut> {
    const res = await requestJson<SuccessResponse<CaptchaOut>>('/commons/captcha', {
      method: 'GET',
      auth: false,
    })
    if (!res.data) throw new Error('Captcha missing')
    return res.data
  },

  async login(payload: LoginRequest): Promise<TokenOut> {
    return requestJson<TokenOut>('/users/login', { method: 'POST', body: payload })
  },
}

