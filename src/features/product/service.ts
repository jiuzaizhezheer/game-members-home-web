import type {
  Product,
  ProductIn,
  ProductListOut,
  ProductQueryParams,
  ProductStatusIn,
} from './types'
import { productApi } from './api'

/** 商品服务 */
export const productService = {
  /** 获取商品列表 */
  async getList(params: ProductQueryParams): Promise<ProductListOut> {
    return await productApi.getList(params)
  },

  /** 获取商品详情 */
  async getDetail(id: string): Promise<Product> {
    return await productApi.getDetail(id)
  },

  /** 创建商品 */
  async create(payload: ProductIn): Promise<Product> {
    return await productApi.create(payload)
  },

  /** 更新商品 */
  async update(id: string, payload: ProductIn): Promise<Product> {
    return await productApi.update(id, payload)
  },

  /** 更新商品状态 */
  async updateStatus(id: string, payload: ProductStatusIn): Promise<Product> {
    return await productApi.updateStatus(id, payload)
  },
}
