import { requestJson } from '@/shared/api/http'
import type {
  FavoriteListOut,
  FavoriteAddIn,
  FavoriteBatchDeleteIn,
  FavoriteCheckOut,
} from './types'

export const favoriteApi = {
  /** 获取收藏列表 */
  async getList(page = 1, pageSize = 20): Promise<FavoriteListOut> {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('page_size', pageSize.toString())
    return await requestJson<FavoriteListOut>(`/favorites/?${params}`, {
      method: 'GET',
    })
  },

  /** 添加收藏 */
  async add(payload: FavoriteAddIn): Promise<void> {
    return await requestJson<void>('/favorites/', {
      method: 'POST',
      body: payload,
    })
  },

  /** 取消收藏 */
  async remove(productId: string): Promise<void> {
    return await requestJson<void>(`/favorites/${productId}`, {
      method: 'DELETE',
    })
  },

  /** 批量取消收藏 */
  async removeBatch(payload: FavoriteBatchDeleteIn): Promise<void> {
    return await requestJson<void>('/favorites/batch', {
      method: 'DELETE',
      body: payload,
    })
  },

  /** 检查收藏状态 */
  async check(productId: string): Promise<FavoriteCheckOut> {
    return await requestJson<FavoriteCheckOut>(`/favorites/${productId}/check`, {
      method: 'GET',
    })
  },
}
