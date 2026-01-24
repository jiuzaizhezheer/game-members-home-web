import { z } from 'zod'

/** 商品信息 */
export type Product = {
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
}

/** 商品列表响应 */
export type ProductListOut = {
  items: Product[]
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
  sku: z.string().max(64).optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().min(0, { message: '价格不能小于0' }),
  stock: z.number().int({ message: '库存必须是整数' }).min(0, { message: '库存不能小于0' }),
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
export type ProductQueryParams = {
  page?: number
  page_size?: number
  keyword?: string
  status?: 'on' | 'off'
}
