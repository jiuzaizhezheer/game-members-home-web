import type {
  ProductOut,
  ProductIn,
  ProductListOut,
  ProductListIn,
  ProductPublicOut,
  ProductPublicListOut,
  ProductStatusIn,
} from './types'
import { productApi } from './api'

/** 商品服务 */
export const productService = {
  /** 获取商家商品列表 */
  async getMerchantList(params: ProductListIn): Promise<ProductListOut> {
    return await productApi.getMerchantList(params)
  },

  /** 获取商家商品详情 */
  async getMerchantDetail(id: string): Promise<ProductOut> {
    return await productApi.getMerchantDetail(id)
  },

  /** 获取公开商品列表 */
  async getPublicList(params: ProductListIn): Promise<ProductPublicListOut> {
    return await productApi.getPublicList(params)
  },

  /** 获取公开商品详情 */
  async getPublicDetail(id: string): Promise<ProductPublicOut> {
    return await productApi.getPublicDetail(id)
  },

  /** 创建商品 */
  async create(payload: ProductIn): Promise<ProductOut> {
    return await productApi.create(payload)
  },

  /** 更新商品 */
  async update(id: string, payload: ProductIn): Promise<ProductOut> {
    return await productApi.update(id, payload)
  },

  /** 更新商品状态 */
  async updateStatus(id: string, payload: ProductStatusIn): Promise<ProductOut> {
    return await productApi.updateStatus(id, payload)
  },
  /** 删除商品 */
  async delete(id: string): Promise<void> {
    return await productApi.delete(id)
  },
}
