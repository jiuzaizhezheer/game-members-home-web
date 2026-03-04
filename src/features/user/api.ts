import { requestJson } from '@/shared/api/http'
import type { PointLogListOut, UserChangePasswordIn, UserOut, UserProfileUpdateIn } from './types'

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

  getPointLogs: (page: number = 1, pageSize: number = 10) =>
    requestJson<PointLogListOut>(`/users/me/points?page=${page}&page_size=${pageSize}`, {
      method: 'GET',
    }),
}
