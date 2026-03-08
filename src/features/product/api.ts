import { requestJson } from '@/shared/api/http'
import type {
  ProductOut,
  ProductIn,
  ProductListOut,
  ProductListIn,
  ProductPublicOut,
  ProductPublicListOut,
  ProductStatusIn,
} from './types'

export const productApi = {
  /** 获取商家商品列表 */
  async getMerchantList(params: ProductListIn): Promise<ProductListOut> {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params.keyword) searchParams.append('keyword', params.keyword)
    if (params.status) searchParams.append('status', params.status)
    if (params.category_id) searchParams.append('category_id', params.category_id)

    const queryString = searchParams.toString()
    return await requestJson<ProductListOut>(`/products/my/list?${queryString}`, {
      method: 'GET',
    })
  },

  /** 获取商家商品详情 */
  async getMerchantDetail(id: string): Promise<ProductOut> {
    return await requestJson<ProductOut>(`/products/my/${id}`, {
      method: 'GET',
    })
  },

  /** 获取公开商品列表 */
  async getPublicList(params: ProductListIn): Promise<ProductPublicListOut> {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params.keyword) searchParams.append('keyword', params.keyword)
    if (params.sort_by) searchParams.append('sort_by', params.sort_by)
    if (params.category_id) searchParams.append('category_id', params.category_id)

    const queryString = searchParams.toString()
    return await requestJson<ProductPublicListOut>(`/products/?${queryString}`, {
      method: 'GET',
      auth: false,
    })
  },

  /** 获取公开商品详情 */
  async getPublicDetail(id: string): Promise<ProductPublicOut> {
    return await requestJson<ProductPublicOut>(`/products/${id}`, {
      method: 'GET',
      auth: false,
    })
  },

  /** 创建商品 */
  async create(payload: ProductIn): Promise<ProductOut> {
    return await requestJson<ProductOut>('/products/', {
      method: 'POST',
      body: payload,
    })
  },

  /** 更新商品 */
  async update(id: string, payload: ProductIn): Promise<ProductOut> {
    return await requestJson<ProductOut>(`/products/${id}`, {
      method: 'PUT',
      body: payload,
    })
  },

  /** 更新商品状态 */
  async updateStatus(id: string, payload: ProductStatusIn): Promise<ProductOut> {
    return await requestJson<ProductOut>(`/products/${id}/status`, {
      method: 'PATCH',
      body: payload,
    })
  },
  /** 删除商品 */
  async delete(id: string): Promise<void> {
    return await requestJson<void>(`/products/${id}`, {
      method: 'DELETE',
    })
  },
}
