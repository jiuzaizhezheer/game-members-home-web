import { z } from 'zod'

/** 商品信息 */
export type ProductOut = {
  id: string
  merchant_id: string
  name: string
  sku: string | null
  description: string | null
  price: number
  stock: number
  status: 'on' | 'off'
  image_url: string | null
  views_count: number
  sales_count: number
  popularity_score: number
  category_ids: string[]
}

export type ProductPromotionOut = {
  id: string
  title: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  start_at: string
  end_at: string
}

/** 公开商品信息 (用户端) */
export type ProductPublicOut = Pick<
  ProductOut,
  | 'id'
  | 'merchant_id'
  | 'name'
  | 'description'
  | 'price'
  | 'stock'
  | 'image_url'
  | 'sales_count'
  | 'popularity_score'
  | 'category_ids'
> & {
  merchant_user_id?: string
  active_promotion?: ProductPromotionOut | null
}

/** 商品列表响应 */
export type ProductListOut = {
  items: ProductOut[]
  total: number
  page: number
  page_size: number
}

/** 公开商品列表响应 */
export type ProductPublicListOut = {
  items: ProductPublicOut[]
  total: number
  page: number
  page_size: number
}

/** 商品表单 Schema */
export const ProductSchema = z.object({
  name: z
    .string()
    .min(2, { message: '商品名称至少2个字符' })
    .max(128, { message: '商品名称不能超过128个字符' }),
  sku: z.string().max(64, { message: 'SKU长度不能超过64位' }).optional().nullable(),
  description: z.string().optional().nullable(),
  price: z
    .number()
    .or(z.nan())
    .transform((val) => (Number.isNaN(val) ? -1 : val))
    .refine((val) => val >= 0, { message: '请输入有效的价格' }),
  stock: z
    .number()
    .or(z.nan())
    .transform((val) => (Number.isNaN(val) ? -1 : val))
    .refine((val) => Number.isInteger(val), { message: '库存必须是整数' })
    .refine((val) => val >= 0, { message: '请输入有效的库存数量' }),
  category_ids: z.array(z.string()).optional(),
  image_url: z.string().optional().nullable(),
})

/** 创建/更新商品请求 (从 Schema 自动推导) */
export type ProductIn = z.infer<typeof ProductSchema>

/** 商品状态更新请求 */
export type ProductStatusIn = {
  status: 'on' | 'off'
}

/** 商品筛选参数 */
export type ProductListIn = {
  page?: number
  page_size?: number
  keyword?: string
  status?: 'on' | 'off'
  sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'popularity_desc'
  category_id?: string
}
