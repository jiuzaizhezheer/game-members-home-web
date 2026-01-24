import { merchantApi } from './api'
import type { MerchantOut, MerchantUpdateIn } from './types'

/** 商家服務 */
export const merchantService = {
  /** 獲取當前商家信息 */
  async getMyMerchant(): Promise<MerchantOut> {
    return await merchantApi.getMyMerchant()
  },

  /** 更新商家信息 */
  async update(id: string, payload: MerchantUpdateIn): Promise<MerchantOut> {
    return await merchantApi.update(id, payload)
  },
}
