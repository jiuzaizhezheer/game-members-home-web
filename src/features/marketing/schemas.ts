import * as z from 'zod'
import { DISCOUNT_TYPES, PROMOTION_STATUS } from './constants'

export const promotionCreateSchema = z
  .object({
    title: z.string().min(2, '标题至少2个字符').max(128, '标题太长'),
    discount_type: z.enum([DISCOUNT_TYPES.PERCENT, DISCOUNT_TYPES.FIXED]),
    discount_value: z.coerce.number().min(0.01, '优惠值必须大于0'),
    start_at: z.string().min(1, '请选择开始时间'),
    end_at: z.string().min(1, '请选择结束时间'),
    product_ids: z.array(z.string()).min(1, '请至少选择一个商品'),
    status: z.enum([PROMOTION_STATUS.ACTIVE, PROMOTION_STATUS.INACTIVE]),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_at).getTime()
      const end = new Date(data.end_at).getTime()
      return end > start
    },
    { message: '结束时间必须晚于开始时间', path: ['end_at'] },
  )
  .refine(
    (data) => {
      if (data.discount_type === 'percent' && data.discount_value > 100) {
        return false
      }
      return true
    },
    { message: '折扣比例不能超过100%', path: ['discount_value'] },
  )

export type PromotionCreateForm = z.infer<typeof promotionCreateSchema>
