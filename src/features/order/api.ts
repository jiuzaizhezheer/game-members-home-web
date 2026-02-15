import { requestJson } from '@/shared/api/http'
import type { OrderOut, OrderCreateIn, OrderListOut } from './types'

export const orderApi = {
  createOrder: (data: OrderCreateIn) =>
    requestJson<OrderOut>('/orders/', {
      method: 'POST',
      body: data,
    }),

  getMyOrders: (page = 1, pageSize = 10) =>
    requestJson<OrderListOut>(`/orders/?page=${page}&page_size=${pageSize}`, {}),

  getOrderDetail: (id: string) => requestJson<OrderOut>(`/orders/${id}`, {}),

  cancelOrder: (id: string) =>
    requestJson<void>(`/orders/${id}/cancel`, {
      method: 'POST',
    }),

  payOrder: (id: string) =>
    requestJson<void>(`/orders/${id}/pay`, {
      method: 'POST',
    }),

  receiptOrder: (id: string) =>
    requestJson<void>(`/orders/${id}/receipt`, {
      method: 'POST',
    }),
}
