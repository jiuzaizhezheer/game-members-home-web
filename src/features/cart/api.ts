import { requestJson } from '@/shared/api/http'
import type { CartOut, CartItemAddIn, CartItemUpdateIn, CartCreateIn } from './types'

export const cartApi = {
  /** 获取我的所有购物车 */
  async getAllCarts(): Promise<CartOut[]> {
    return await requestJson<CartOut[]>('/carts/list', {})
  },

  /** 获取特定或当前的活动购物车 */
  async getMyCart(id?: string): Promise<CartOut> {
    const url = id ? `/carts/${id}` : '/carts/'
    return await requestJson<CartOut>(url, {})
  },

  /** 创建新的购物车 */
  async createCart(payload: CartCreateIn): Promise<CartOut> {
    return await requestJson<CartOut>('/carts/', {
      method: 'POST',
      body: payload,
    })
  },

  /** 删除购物车 */
  async deleteCart(id: string): Promise<void> {
    await requestJson<void>(`/carts/${id}`, {
      method: 'DELETE',
    })
  },

  /** 添加商品到购物车 */
  async addItem(payload: CartItemAddIn): Promise<void> {
    await requestJson<void>('/carts/items', {
      method: 'POST',
      body: payload,
    })
  },

  /** 更新购物车商品数量 */
  async updateItem(id: string, payload: CartItemUpdateIn): Promise<void> {
    await requestJson<void>(`/carts/items/${id}`, {
      method: 'PUT',
      body: payload,
    })
  },

  /** 移除购物车商品 */
  async removeItem(id: string): Promise<void> {
    await requestJson<void>(`/carts/items/${id}`, {
      method: 'DELETE',
    })
  },

  /** 清空购物车 */
  async clearCart(): Promise<void> {
    await requestJson<void>('/carts/', {
      method: 'DELETE',
    })
  },
}
