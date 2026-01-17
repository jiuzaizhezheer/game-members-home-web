import { requestJson } from '@/shared/api/http'
import type {
  Product,
  ProductIn,
  ProductListOut,
  ProductQueryParams,
  ProductStatusIn,
} from './types'

export const productApi = {
  /** 获取商品列表 */
  async getList(params: ProductQueryParams): Promise<ProductListOut> {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params.keyword) searchParams.append('keyword', params.keyword)
    if (params.status) searchParams.append('status', params.status)

    const queryString = searchParams.toString()
    return await requestJson<ProductListOut>(`/products/?${queryString}`, {
      method: 'GET',
    })
  },

  /** 获取商品详情 */
  async getDetail(id: string): Promise<Product> {
    return await requestJson<Product>(`/products/${id}`, {
      method: 'GET',
    })
  },

  /** 创建商品 */
  async create(payload: ProductIn): Promise<Product> {
    return await requestJson<Product>('/products/', {
      method: 'POST',
      body: payload,
    })
  },

  /** 更新商品 */
  async update(id: string, payload: ProductIn): Promise<Product> {
    return await requestJson<Product>(`/products/${id}`, {
      method: 'PUT',
      body: payload,
    })
  },

  /** 更新商品状态 */
  async updateStatus(id: string, payload: ProductStatusIn): Promise<Product> {
    return await requestJson<Product>(`/products/${id}/status`, {
      method: 'PATCH',
      body: payload,
    })
  },
}
