import { requestJson } from '@/shared/api/http'
import type {
  OrderOut,
  OrderCreateIn,
  OrderListOut,
  BuyNowIn,
  OrderRefundApplyIn,
  OrderRefundOut,
  OrderLogisticsOut,
} from './types'

export const orderApi = {
  createOrder: (data: OrderCreateIn) =>
    requestJson<OrderOut>('/orders/', {
      method: 'POST',
      body: data,
    }),

  buyNow: (data: BuyNowIn) =>
    requestJson<OrderOut>('/orders/buy-now', {
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

  applyRefund: (id: string, data: OrderRefundApplyIn) =>
    requestJson<OrderRefundOut>(`/orders/${id}/refund`, {
      method: 'POST',
      body: data,
    }),

  getRefundDetail: (id: string) => requestJson<OrderRefundOut>(`/orders/${id}/refund`, {}),

  getOrderLogistics: (id: string) => requestJson<OrderLogisticsOut>(`/orders/${id}/logistics`, {}),
}
