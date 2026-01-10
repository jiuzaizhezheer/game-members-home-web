import { requestJson } from '@/shared/api/http'
import type { SuccessResponse } from '@/shared/api/types'
import type { RegisterRequest } from '@/features/user/types'

export const userApi = {
  async register(payload: RegisterRequest): Promise<void> {
    await requestJson<SuccessResponse<null>>('/users/register', {
      method: 'POST',
      body: payload,
      auth: false,
    })
  },
}

