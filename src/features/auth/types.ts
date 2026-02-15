import { z } from 'zod'

/** 验证码 */
export type CaptchaOut = {
  id: string
  image: string
}

/** Access Token */
export type AccessTokenOut = {
  access_token: string
}

/** 注册校验 Schema */
export const AuthRegisterSchema = z.object({
  username: z
    .string()
    .min(6, { message: '用户名长度至少为6位' })
    .max(64, { message: '用户名长度不能超过64位' }),
  email: z.string().email({ message: '邮箱格式不正确' }),
  password: z
    .string()
    .min(6, { message: '密码长度至少为6位' })
    .max(128, { message: '密码长度不能超过128位' })
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, { message: '密码需包含字母和数字' }),
  role: z.enum(['member', 'merchant', 'admin'], {
    message: '请选择正确的角色',
  }),
  captcha_id: z.string().length(36, { message: '无效的验证码ID' }),
  captcha_code: z.string().length(6, { message: '验证码必须是6位' }),
})

/** 登录校验 Schema */
export const AuthLoginSchema = z.object({
  email: z.string().email({ message: '邮箱格式不正确' }),
  password: z.string().min(1, { message: '请输入密码' }),
  role: z.enum(['member', 'merchant', 'admin'], {
    message: '请选择正确的角色',
  }),
})

/** 角色类型 (从 Schema 自动推导) */
export type Role = z.infer<typeof AuthRegisterSchema>['role']

/** 登录请求体 (从 Schema 自动推导) */
export type AuthLoginIn = z.infer<typeof AuthLoginSchema>

/** 注册请求体 (从 Schema 自动推导) */
export type AuthRegisterIn = z.infer<typeof AuthRegisterSchema>
