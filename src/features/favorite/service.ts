import type { FavoriteListOut, FavoriteCheckOut } from './types'
import { favoriteApi } from './api'

/** 收藏服务 */
export const favoriteService = {
  /** 获取收藏列表 */
  async getList(page?: number, pageSize?: number): Promise<FavoriteListOut> {
    return await favoriteApi.getList(page, pageSize)
  },

  /** 添加收藏 */
  async add(productId: string): Promise<void> {
    return await favoriteApi.add({ product_id: productId })
  },

  /** 取消收藏 */
  async remove(productId: string): Promise<void> {
    return await favoriteApi.remove(productId)
  },

  /** 批量取消收藏 */
  async removeBatch(productIds: string[]): Promise<void> {
    return await favoriteApi.removeBatch({ product_ids: productIds })
  },

  /** 检查收藏状态 */
  async check(productId: string): Promise<FavoriteCheckOut> {
    return await favoriteApi.check(productId)
  },
}
