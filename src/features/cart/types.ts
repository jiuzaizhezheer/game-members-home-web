import { z } from 'zod'
import type { ProductPromotionOut } from '../product/types'

/** 购物车商品信息 */
export type CartItemOut = {
  id: string
  product_id: string
  product_name: string
  product_image: string | null
  unit_price: number
  original_price: number | null
  quantity: number
  subtotal: number
  active_promotion: ProductPromotionOut | null
}

/** 购物车信息 */
export type CartOut = {
  id: string
  name: string
  is_checked_out: boolean
  items: CartItemOut[]
  total_amount: number
  total_quantity: number
}

/** 创建购物车请求校验 Schema */
export const CartCreateInSchema = z.object({
  name: z.string().min(1, { message: '名称不能为空' }).max(128, { message: '名称过长' }),
})

/** 创建购物车请求体 */
export type CartCreateIn = z.infer<typeof CartCreateInSchema>

/** 添加商品到购物车请求校验 Schema */
export const CartItemAddInSchema = z.object({
  product_id: z.string().uuid({ message: '无效的商品ID' }),
  quantity: z
    .number()
    .int()
    .min(1, { message: '数量至少为1' })
    .max(99, { message: '数量不能超过99' }),
})

/** 添加商品到购物车请求体 */
export type CartItemAddIn = z.infer<typeof CartItemAddInSchema>

/** 更新购物车商品数量请求体 */
export type CartItemUpdateIn = {
  quantity: number
}
