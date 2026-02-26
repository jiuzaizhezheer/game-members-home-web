import { requestJson } from '@/shared/api/http'
import type { MerchantOut, MerchantUpdateIn, OrderRefundAuditIn, OrderRefundListOut } from './types'
import type { GroupCreateIn, GroupItemOut, GroupListOut, PostListOut } from '../community/types'
import type { OrderListOut, OrderShipIn, OrderRefundOut } from '../order/types'

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

  async getOrders(
    page = 1,
    pageSize = 10,
    status?: string,
    refundStatus?: string,
  ): Promise<OrderListOut> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (status) params.append('status', status)
    if (refundStatus) params.append('refund_status', refundStatus)

    return await requestJson<OrderListOut>(`/merchants/orders?${params.toString()}`, {
      method: 'GET',
    })
  },

  async shipOrder(id: string, payload: OrderShipIn): Promise<void> {
    return await requestJson<void>(`/merchants/orders/${id}/ship`, {
      method: 'POST',
      body: payload,
    })
  },

  async getRefunds(page = 1, pageSize = 10, status?: string): Promise<OrderRefundListOut> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (status) params.append('status', status)

    return await requestJson<OrderRefundListOut>(`/merchants/orders/refunds?${params.toString()}`, {
      method: 'GET',
    })
  },

  async auditRefund(refundId: string, payload: OrderRefundAuditIn): Promise<OrderRefundOut> {
    return await requestJson<OrderRefundOut>(`/merchants/orders/refunds/${refundId}/audit`, {
      method: 'POST',
      body: payload,
    })
  },

  // --- Community ---
  async getMyGroups(page = 1, pageSize = 20) {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() })
    return await requestJson<GroupListOut>(`/merchants/communities/groups?${params.toString()}`, {
      method: 'GET',
    })
  },

  async createGroup(data: GroupCreateIn): Promise<GroupItemOut> {
    return await requestJson<GroupItemOut>('/merchants/communities/groups', {
      method: 'POST',
      body: data,
    })
  },

  async updateGroup(id: string, data: GroupCreateIn): Promise<GroupItemOut> {
    return await requestJson<GroupItemOut>(`/merchants/communities/groups/${id}`, {
      method: 'PUT',
      body: data,
    })
  },

  async getPendingPosts(page = 1, pageSize = 20) {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() })
    return await requestJson<PostListOut>(`/merchants/communities/posts?${params.toString()}`, {
      method: 'GET',
    })
  },

  async moderatePost(id: string, is_hidden: boolean) {
    return await requestJson<void>(`/merchants/communities/posts/${id}/status`, {
      method: 'PATCH',
      body: { is_hidden },
    })
  },
}
