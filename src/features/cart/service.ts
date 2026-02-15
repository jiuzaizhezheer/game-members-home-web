import { cartApi } from './api'
import type { CartOut, CartItemAddIn, CartItemUpdateIn, CartCreateIn } from './types'

/** 购物车服务 */
export const cartService = {
  /** 获取所有购物车列表 */
  async getAllCarts(): Promise<CartOut[]> {
    return await cartApi.getAllCarts()
  },

  /** 获取我的当前或特定购物车 */
  async getMyCart(id?: string): Promise<CartOut> {
    return await cartApi.getMyCart(id)
  },

  /** 创建购物车 */
  async createCart(payload: CartCreateIn): Promise<CartOut> {
    return await cartApi.createCart(payload)
  },

  /** 删除购物车 */
  async deleteCart(id: string): Promise<void> {
    return await cartApi.deleteCart(id)
  },

  /** 添加商品到购物车 */
  async addItem(payload: CartItemAddIn): Promise<void> {
    return await cartApi.addItem(payload)
  },

  /** 更新购物车商品数量 */
  async updateItem(id: string, payload: CartItemUpdateIn): Promise<void> {
    return await cartApi.updateItem(id, payload)
  },

  /** 移除购物车商品 */
  async removeItem(id: string): Promise<void> {
    return await cartApi.removeItem(id)
  },

  /** 清空指定购物车 */
  async clearCart(): Promise<void> {
    return await cartApi.clearCart()
  },
}
