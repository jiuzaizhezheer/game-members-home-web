import { z } from 'zod'

/** 商家店铺信息 */
export type MerchantOut = {
  id: string
  user_id: string
  shop_name: string
  contact_phone: string | null
  shop_desc: string | null
  created_at: string
}

/** 店铺信息更新 Schema (用于表单校验) */
export const MerchantUpdateSchema = z.object({
  shop_name: z
    .string()
    .min(2, { message: '店铺名称至少2个字符' })
    .max(128, { message: '店铺名称不能超过128个字符' }),
  contact_phone: z.string().length(11, { message: '联系电话必须是11位' }).optional().nullable(),
  shop_desc: z.string().optional().nullable(),
})

/** 更新商家店铺信息请求 (从 Schema 自动推导) */
export type MerchantUpdateIn = z.infer<typeof MerchantUpdateSchema>
