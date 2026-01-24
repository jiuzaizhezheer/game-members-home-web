import { useEffect, useState } from 'react'
import { Users, Store, Package, ShoppingCart, FileSearch, TrendingUp, Activity } from 'lucide-react'
import { toast } from 'sonner'

import { adminApi } from '@/features/admin/api'
import type { DashboardStats } from '@/features/admin/types'

/**
 * 管理后台仪表盘页面
 * 显示平台概览数据
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const data = await adminApi.getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        toast.error('获取仪表盘数据失败')
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const statCards = [
    {
      icon: Users,
      label: '总用户数',
      value: stats?.total_users ?? 0,
      color: 'bg-indigo-50 text-indigo-600',
      iconBg: 'bg-indigo-100',
    },
    {
      icon: Store,
      label: '商家数量',
      value: stats?.total_merchants ?? 0,
      color: 'bg-teal-50 text-teal-600',
      iconBg: 'bg-teal-100',
    },
    {
      icon: Package,
      label: '商品总数',
      value: stats?.total_products ?? 0,
      color: 'bg-amber-50 text-amber-600',
      iconBg: 'bg-amber-100',
    },
    {
      icon: ShoppingCart,
      label: '订单总数',
      value: stats?.total_orders ?? 0,
      color: 'bg-rose-50 text-rose-600',
      iconBg: 'bg-rose-100',
    },
    {
      icon: FileSearch,
      label: '待审核',
      value: stats?.pending_audits ?? 0,
      color: 'bg-purple-50 text-purple-600',
      iconBg: 'bg-purple-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">仪表盘</h1>
          <p className="mt-1 text-sm text-zinc-500">欢迎来到游戏会员之家管理后台</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Activity size={16} className="text-teal-500" />
          <span>系统运行正常</span>
        </div>
      </div>

      {/* 统计卡片 */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5"
            >
              <div className="h-10 w-10 rounded-xl bg-zinc-100" />
              <div className="mt-4 h-8 w-20 rounded bg-zinc-100" />
              <div className="mt-2 h-4 w-16 rounded bg-zinc-100" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="group rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-indigo-100"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <card.icon size={20} className={card.color.split(' ')[1]} />
              </div>
              <div className="mt-4 text-3xl font-bold text-zinc-800">
                {card.value.toLocaleString()}
              </div>
              <div className="mt-1 text-sm text-zinc-500">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 趋势图占位区 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 用户增长趋势 */}
        <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-800">用户增长趋势</h2>
            <TrendingUp size={20} className="text-teal-500" />
          </div>
          <div className="mt-6 flex h-48 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400">
            <div className="text-center">
              <Package size={32} className="mx-auto mb-2 text-zinc-300" />
              <p className="text-sm">图表功能即将上线</p>
            </div>
          </div>
        </div>

        {/* 订单量趋势 */}
        <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-800">订单量趋势</h2>
            <TrendingUp size={20} className="text-rose-500" />
          </div>
          <div className="mt-6 flex h-48 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400">
            <div className="text-center">
              <ShoppingCart size={32} className="mx-auto mb-2 text-zinc-300" />
              <p className="text-sm">图表功能即将上线</p>
            </div>
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5">
        <h2 className="text-lg font-semibold text-zinc-800">最近活动</h2>
        <div className="mt-6 flex h-32 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400">
          <div className="text-center">
            <Activity size={32} className="mx-auto mb-2 text-zinc-300" />
            <p className="text-sm">活动日志功能即将上线</p>
          </div>
        </div>
      </div>
    </div>
  )
}
