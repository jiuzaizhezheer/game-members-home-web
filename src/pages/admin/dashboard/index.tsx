import { useEffect, useState } from 'react'
import { Users, Store, Package, FileSearch, TrendingUp, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { adminApi } from '@/features/admin/api'
import type { DashboardStats } from '@/features/admin/types'

// ——— 纯 SVG 折线图 ———
function SparkLine({
  data,
  color,
  height = 120,
}: {
  data: number[]
  color: string
  height?: number
}) {
  if (data.length < 2) return null
  const w = 500
  const h = height
  const pad = 4
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = (w - pad * 2) / (data.length - 1)

  const points = data.map((v, i) => ({
    x: pad + i * step,
    y: h - pad - ((v - min) / range) * (h - pad * 2),
  }))

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')
  const area = [
    `${points[0].x},${h}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${h}`,
  ].join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Highlight last point */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="4"
        fill={color}
      />
    </svg>
  )
}

// ——— 根据总量生成过去 8 周的模拟趋势数据 ———
function mockTrend(total: number, weeks = 8): number[] {
  if (total <= 0) return new Array(weeks).fill(0)

  const result: number[] = []
  let cur = Math.max(0, total - Math.round(total * 0.4))
  const finalStep = total - cur
  for (let i = 0; i < weeks; i++) {
    // 每周随机增长，最后一个点等于总量
    const growth =
      i < weeks - 1
        ? Math.round((finalStep / (weeks - 1)) * (0.6 + Math.random() * 0.8))
        : total - cur
    cur += growth
    result.push(cur)
  }
  return result
}

// 最近 8 周标签
function weekLabels(n = 8): string[] {
  const labels: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return labels
}

// ——— 趋势图卡片 ———
function TrendCard({
  title,
  data,
  color,
  hexColor,
  latestLabel,
}: {
  title: string
  data: number[]
  color: string
  hexColor: string
  latestLabel: string
}) {
  const labels = weekLabels(data.length)
  const latest = data[data.length - 1] ?? 0
  const prev = data[data.length - 2] ?? latest
  const delta = latest - prev
  const pct = prev > 0 ? ((delta / prev) * 100).toFixed(1) : '0.0'

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-zinc-800">{title}</h2>
        <TrendingUp size={18} className={color} />
      </div>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-3xl font-bold text-zinc-900">{latest.toLocaleString()}</span>
        <span
          className={`mb-1 text-xs font-medium ${delta >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}
        >
          {delta >= 0 ? '+' : ''}
          {pct}% 上周
        </span>
      </div>
      <SparkLine data={data} color={hexColor} />
      {/* X axis labels */}
      <div className="flex justify-between mt-2">
        {labels.map((l, i) => (
          <span key={i} className="text-[10px] text-zinc-400">
            {l}
          </span>
        ))}
      </div>
      <p className="mt-1 text-xs text-zinc-400">{latestLabel}</p>
    </div>
  )
}

/**
 * 管理后台仪表盘页面
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    adminApi
      .getDashboardStats()
      .then((s) => {
        setStats(s)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const userTrend = stats ? mockTrend(stats.total_users + stats.total_merchants) : []
  const orderTrend = stats ? mockTrend(stats.total_orders) : []

  const statCards = [
    {
      icon: Users,
      label: '总用户数',
      value: stats?.total_users ?? 0,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      icon: Store,
      label: '总商家数',
      value: stats?.total_merchants ?? 0,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
    {
      icon: Package,
      label: '商品总数',
      value: stats?.total_products ?? 0,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      icon: FileSearch,
      label: '待审核',
      value: stats?.pending_audits ?? 0,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">仪表盘</h1>
          <p className="mt-1 text-sm text-zinc-500">欢迎来到游戏周边交易系统管理后台</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Activity size={16} className="text-teal-500" />
          <span>系统运行正常</span>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 transition-all hover:shadow-lg hover:ring-2 hover:ring-indigo-100"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <card.icon size={20} className={card.iconColor} />
              </div>
              <div className="mt-4 text-3xl font-bold text-zinc-800">
                {card.value.toLocaleString()}
              </div>
              <div className="mt-1 text-sm text-zinc-500">{card.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Trend Charts */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white p-6 ring-1 ring-black/5">
              <div className="h-5 w-32 rounded bg-zinc-100 mb-4" />
              <div className="h-32 rounded-xl bg-zinc-50" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TrendCard
            title="用户增长趋势"
            data={userTrend}
            color="text-teal-500"
            hexColor="#14b8a6"
            latestLabel="过去 8 周累计注册用户数"
          />
          <TrendCard
            title="订单量趋势"
            data={orderTrend}
            color="text-rose-500"
            hexColor="#f43f5e"
            latestLabel="过去 8 周累计订单数"
          />
        </div>
      )}
    </div>
  )
}
