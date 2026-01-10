export type Role = 'member' | 'merchant' | 'admin'

export type RegisterRequest = {
  username: string
  email: string
  password: string
  role: Role
  captcha_id: string
  captcha_code: string
}

