import { requestJson } from '@/shared/api/http'
import type { MerchantOut, MerchantUpdateIn } from './types'

export const merchantApi = {
  /** 获取当前商家信息 */
  async getMyMerchant(): Promise<MerchantOut> {
    return await requestJson<MerchantOut>('/merchants/my-merchant', {
      method: 'GET',
    })
  },

  /** 更新商家信息 */
  async update(id: string, payload: MerchantUpdateIn): Promise<MerchantOut> {
    return await requestJson<MerchantOut>(`/merchants/${id}`, {
      method: 'PUT',
      body: payload,
    })
  },
}
