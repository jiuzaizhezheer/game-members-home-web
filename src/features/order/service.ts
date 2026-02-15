import { orderApi } from './api'
import type { OrderCreateIn } from './types'

export const orderService = {
  createOrder: async (data: OrderCreateIn) => {
    return await orderApi.createOrder(data)
  },

  getMyOrders: async (page?: number, pageSize?: number) => {
    return await orderApi.getMyOrders(page, pageSize)
  },

  getOrderDetail: async (id: string) => {
    return await orderApi.getOrderDetail(id)
  },

  cancelOrder: async (id: string) => {
    return await orderApi.cancelOrder(id)
  },

  payOrder: async (id: string) => {
    return await orderApi.payOrder(id)
  },

  receiptOrder: async (id: string) => {
    return await orderApi.receiptOrder(id)
  },
}
