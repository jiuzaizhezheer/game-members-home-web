import { requestJson } from '@/shared/api/http'
import type { AdminProfileOut, DashboardStats } from './types'
import type { GroupCreateIn, GroupItemOut } from '@/features/community/types'

export const adminApi = {
  /** 获取管理员个人信息 */
  async getProfile(): Promise<AdminProfileOut> {
    return await requestJson<AdminProfileOut>('/admins/profile', {
      method: 'GET',
    })
  },

  /** 获取仪表盘统计数据 */
  async getDashboardStats(): Promise<DashboardStats> {
    return await requestJson<DashboardStats>('/admins/dashboard', {
      method: 'GET',
    })
  },

  /** 创建社群话题圈 */
  async createCommunityGroup(data: GroupCreateIn): Promise<GroupItemOut> {
    return await requestJson<GroupItemOut>('/admins/community/groups', {
      method: 'POST',
      body: data,
    })
  },
}
