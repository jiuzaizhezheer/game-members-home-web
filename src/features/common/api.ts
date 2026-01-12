import { requestJson } from '@/shared/api/http'
import type { CaptchaOut } from '@/features/common/types'

export const commonApi = {
    /**
     * 获取验证码
     */
    async getCaptcha(): Promise<CaptchaOut> {
        return await requestJson<CaptchaOut>('/commons/captcha', {
            method: 'GET',
            auth: false,
        })
    },
}
