/** 角色 */
export type Role = 'member' | 'merchant' | 'admin'

/** 登录请求体 */
export type AuthLoginIn = {
  email: string
  password: string
  role: Role
}

/** 注册请求体 */
export type AuthRegisterIn = {
  username: string
  email: string
  password: string
  role: Role
  captcha_id: string
  captcha_code: string
}

