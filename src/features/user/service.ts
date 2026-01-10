import type { RegisterRequest } from '@/features/user/types'
import { userApi } from '@/features/user/api'

export const userService = {
  async register(payload: RegisterRequest): Promise<void> {
    await userApi.register(payload)
  },
}

