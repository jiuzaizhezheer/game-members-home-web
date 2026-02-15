import { requestJson } from '@/shared/api/http'
import type { UserChangePasswordIn, UserOut, UserProfileUpdateIn } from './types'

export const userApi = {
  getMe: () => requestJson<UserOut>('/users/me', { method: 'GET' }),

  updateProfile: (data: UserProfileUpdateIn) =>
    requestJson<UserOut>('/users/me', {
      method: 'PUT',
      body: data,
    }),

  changePassword: (data: UserChangePasswordIn) =>
    requestJson<void>('/users/me/password', {
      method: 'PUT',
      body: data,
    }),
}
