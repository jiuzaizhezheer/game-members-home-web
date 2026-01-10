import type { Role } from '@/features/user/types'

export type CaptchaOut = {
  id: string
  image: string
}

export type TokenOut = {
  access_token: string
  refresh_token: string
}

export type LoginRequest = {
  email: string
  password: string
  role: Role
}

