import type { ProductPublicOut } from '../product/types'

export interface PromotionBase {
  title: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  start_at: string
  end_at: string
  status: 'active' | 'inactive'
}

export interface PromotionCreateIn extends PromotionBase {
  product_ids: string[]
}

export type PromotionUpdateIn = Partial<PromotionBase> & {
  product_ids?: string[]
}

export interface PromotionOut extends PromotionBase {
  id: string
  merchant_id: string
  created_at: string
  updated_at: string
}

export interface PromotionDetailOut extends PromotionOut {
  products: ProductPublicOut[]
}

export interface PromotionListOut {
  items: PromotionOut[]
  total: number
  page: number
  page_size: number
}
