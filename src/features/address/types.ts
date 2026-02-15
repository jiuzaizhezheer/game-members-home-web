import { z } from 'zod'

export const AddressCreateInSchema = z.object({
  receiver_name: z
    .string()
    .min(2, { message: '收货人姓名至少2个字符' })
    .max(64, { message: '收货人姓名最多64个字符' }),
  phone: z.string().length(11, { message: '请输入11位手机号' }),
  province: z.string().min(2, { message: '请选择/输入省份' }).max(64, { message: '省份名称过长' }),
  city: z.string().min(2, { message: '请选择/输入城市' }).max(64, { message: '城市名称过长' }),
  district: z.string().max(64, { message: '区县名称过长' }).nullable().optional(),
  detail: z
    .string()
    .min(5, { message: '详细地址至少5个字符' })
    .max(255, { message: '详细地址过长' }),
  is_default: z.boolean(),
})

export type AddressCreateIn = z.infer<typeof AddressCreateInSchema>

export const AddressUpdateInSchema = AddressCreateInSchema.partial()

export type AddressUpdateIn = z.infer<typeof AddressUpdateInSchema>

export interface AddressOut {
  id: string
  user_id: string
  receiver_name: string
  phone: string
  province: string
  city: string
  district: string | null
  detail: string
  is_default: boolean
}
