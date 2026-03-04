import { userApi } from './api'
import type { UserChangePasswordIn, UserProfileUpdateIn } from './types'

export const userService = {
  getMe: async () => {
    return await userApi.getMe()
  },

  updateProfile: async (data: UserProfileUpdateIn) => {
    return await userApi.updateProfile(data)
  },

  changePassword: (data: UserChangePasswordIn) => userApi.changePassword(data),

  getPointLogs: (page: number, pageSize: number) => userApi.getPointLogs(page, pageSize),
}
