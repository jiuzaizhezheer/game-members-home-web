import { z } from 'zod'

export const UserChangePasswordInSchema = z.object({
  old_password: z.string().min(1, { message: '请输入旧密码' }),
  new_password: z
    .string()
    .min(6, { message: '新密码至少6位' })
    .max(128, { message: '密码长度不能超过128位' }),
})

export type UserChangePasswordIn = z.infer<typeof UserChangePasswordInSchema>

export const UserOutSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: z.string(),
  avatar_url: z.string().nullable(),
  points: z.number().default(0),
  total_spent: z.number().default(0),
  level: z.string().default('bronze'),
  next_level_threshold: z.number().nullable().optional(),
  next_level_name: z.string().nullable().optional(),
  created_at: z.string(),
})

export type UserOut = z.infer<typeof UserOutSchema>

export const PointLogOutSchema = z.object({
  id: z.string().uuid(),
  change_amount: z.number(),
  balance_after: z.number(),
  reason: z.string(),
  related_id: z.string().nullable(),
  created_at: z.string(),
})

export type PointLogOut = z.infer<typeof PointLogOutSchema>

export const PointLogListOutSchema = z.object({
  items: z.array(PointLogOutSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})

export type PointLogListOut = z.infer<typeof PointLogListOutSchema>

export const UserProfileUpdateInSchema = z.object({
  username: z.string().optional(),
  avatar_url: z.string().nullable().optional(),
  email: z.string().email({ message: '请输入有效的邮箱地址' }).optional(),
})

export type UserProfileUpdateIn = z.infer<typeof UserProfileUpdateInSchema>
