import { requestJson } from '@/shared/api/http'
import type { AdminProfileOut, DashboardStats } from './types'

export const adminApi = {
  /** 获取管理员个人信息 */
  async getProfile(): Promise<AdminProfileOut> {
    return await requestJson<AdminProfileOut>('/admin/profile', {
      method: 'GET',
    })
  },

  /** 获取仪表盘统计数据 */
  async getDashboardStats(): Promise<DashboardStats> {
    return await requestJson<DashboardStats>('/admin/dashboard', {
      method: 'GET',
    })
  },
}
