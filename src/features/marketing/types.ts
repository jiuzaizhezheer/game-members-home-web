import type { ProductPublicOut } from '../product/types'
import { z } from 'zod'

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
  display_status: 'active' | 'inactive' | 'pending' | 'expired'
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

// --- Coupons ---

export interface CouponBase {
  title: string
  description?: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_spend: number
  total_quantity: number
  start_at: string
  end_at: string
}

export const CouponCreateInSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(50, '标题过长'),
  description: z.string().max(200, '描述过长').optional(),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.number().positive('折扣值必须大于0'),
  min_spend: z.number().min(0, '门槛金额不能为负'),
  total_quantity: z.number().min(0, '总量不能为负（0表示不限量）'),
  start_at: z.string().min(1, '请选择开始时间'),
  end_at: z.string().min(1, '请选择结束时间'),
})

export type CouponCreateIn = z.infer<typeof CouponCreateInSchema>

export interface CouponOut extends CouponBase {
  id: string
  merchant_id?: string
  issued_count: number
  status: 'active' | 'inactive'
  display_status: 'active' | 'inactive' | 'pending' | 'expired'
  created_at: string
  updated_at: string
}

export interface UserCouponOut {
  id: string
  user_id: string
  coupon_id: string
  coupon?: CouponOut
  status: 'unused' | 'used' | 'expired'
  used_at?: string
  order_id?: string
  created_at: string
}

export interface CouponClaimIn {
  coupon_id: string
}
