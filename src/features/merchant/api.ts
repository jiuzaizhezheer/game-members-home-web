import { requestJson } from '@/shared/api/http'
import type { MerchantOut, MerchantUpdateIn } from './types'
import type { OrderListOut } from '../order/types'

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

  async getOrders(page = 1, pageSize = 10, status?: string): Promise<OrderListOut> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (status) params.append('status', status)

    return await requestJson<OrderListOut>(`/merchants/orders?${params.toString()}`, {
      method: 'GET',
    })
  },

  async shipOrder(id: string): Promise<void> {
    return await requestJson<void>(`/merchants/orders/${id}/ship`, {
      method: 'POST',
    })
  },
}
