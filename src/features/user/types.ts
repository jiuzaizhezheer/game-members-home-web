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
  created_at: z.string(),
})

export type UserOut = z.infer<typeof UserOutSchema>

export const UserProfileUpdateInSchema = z.object({
  username: z.string().optional(),
  avatar_url: z.string().nullable().optional(),
  email: z.string().email({ message: '请输入有效的邮箱地址' }).optional(),
})

export type UserProfileUpdateIn = z.infer<typeof UserProfileUpdateInSchema>
