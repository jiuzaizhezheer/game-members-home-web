import { z } from 'zod'
import {
  CHINA_MOBILE_PHONE_MESSAGE,
  isValidChinaMobilePhone,
  normalizeChinaMobilePhone,
} from '@/shared/utils/phone'

/** 商家店铺信息 */
export type MerchantOut = {
  id: string
  user_id: string
  shop_name: string
  contact_phone: string | null
  shop_desc: string | null
  logo_url: string | null
  created_at: string
}

/** 店铺信息更新 Schema (用于表单校验) */
export const MerchantUpdateSchema = z.object({
  shop_name: z
    .string()
    .min(2, { message: '店铺名称至少2个字符' })
    .max(128, { message: '店铺名称不能超过128个字符' }),
  contact_phone: z
    .string()
    .trim()
    .refine((value) => value === '' || isValidChinaMobilePhone(value), {
      message: CHINA_MOBILE_PHONE_MESSAGE,
    })
    .transform((value) => (value === '' ? null : normalizeChinaMobilePhone(value)))
    .optional()
    .nullable(),
  shop_desc: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
})

/** 更新商家店铺信息请求 (从 Schema 自动推导) */
export type MerchantUpdateIn = z.infer<typeof MerchantUpdateSchema>

import type { OrderRefundOut } from '../order/types'

export const OrderRefundAuditInSchema = z.object({
  status: z.enum(['approved', 'rejected'], { message: '请选择审核结果' }),
  merchant_reply: z.string().max(255, '备注不能超过255个字符').optional().nullable(),
})

export type OrderRefundAuditIn = z.infer<typeof OrderRefundAuditInSchema>

export interface OrderRefundListOut {
  items: OrderRefundOut[]
  total: number
  page: number
  page_size: number
}
