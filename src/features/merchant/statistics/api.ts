import { requestJson } from '@/shared/api/http'
import type { DashboardOverviewOut, ProductRankingOut, SalesTrendOut } from './types'

export const statisticsApi = {
  /** 获取仪表盘概况 */
  async getDashboardOverview(): Promise<DashboardOverviewOut> {
    return await requestJson<DashboardOverviewOut>('/merchants/statistics/dashboard', {
      method: 'GET',
    })
  },

  /** 获取销量趋势 */
  async getSalesTrend(days: number = 30): Promise<SalesTrendOut> {
    const searchParams = new URLSearchParams()
    searchParams.append('days', days.toString())

    return await requestJson<SalesTrendOut>(
      `/merchants/statistics/sales-trend?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    )
  },

  /** 获取商品销量排行 */
  async getTopProducts(limit: number = 5): Promise<ProductRankingOut> {
    const searchParams = new URLSearchParams()
    searchParams.append('limit', limit.toString())

    return await requestJson<ProductRankingOut>(
      `/merchants/statistics/top-products?${searchParams.toString()}`,
      {
        method: 'GET',
      },
    )
  },
}
