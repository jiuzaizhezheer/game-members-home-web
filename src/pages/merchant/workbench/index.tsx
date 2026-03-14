import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Plus,
  Settings,
  ArrowRight,
  PackageSearch,
  Trophy,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { productService } from '@/features/product/service'
import { statisticsApi } from '@/features/merchant/statistics/api'
import type { ProductOut } from '@/features/product/types'
import type {
  DashboardOverviewOut,
  SalesTrendItem,
  ProductRankingItem,
} from '@/features/merchant/statistics/types'
import { getFileUrl } from '@/shared/utils/file'

export default function MerchantWorkbench() {
  const navigate = useNavigate()

  const [overview, setOverview] = useState<DashboardOverviewOut>({
    total_sales: 0,
    order_count: 0,
    product_count: 0,
    today_sales: 0,
  })
  const [salesTrend, setSalesTrend] = useState<SalesTrendItem[]>([])
  const [topProducts, setTopProducts] = useState<ProductRankingItem[]>([])
  const [recentProducts, setRecentProducts] = useState<ProductOut[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [overviewRes, trendRes, topRes, productsRes] = await Promise.all([
          statisticsApi.getDashboardOverview(),
          statisticsApi.getSalesTrend(7), // Get last 7 days
          statisticsApi.getTopProducts(5),
          productService.getMerchantList({ page: 1, page_size: 5 }),
        ])

        setOverview(overviewRes)
        setSalesTrend(trendRes.items)
        setTopProducts(topRes.items)
        setRecentProducts(productsRes.items)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statCards = [
    {
      label: '总销售额 (¥)',
      value: Number(overview.total_sales).toFixed(2),
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: '累计订单',
      value: overview.order_count,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: '商品总数',
      value: overview.product_count,
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: '今日成交',
      value: `¥${Number(overview.today_sales).toFixed(2)}`,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">工作台</h1>
        <p className="mt-1 text-sm text-zinc-500">欢迎回来！这里是您的店铺经营概况。</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                <div className="mt-2 text-2xl font-bold text-zinc-900">
                  {loading ? (
                    <div className="h-8 w-24 animate-pulse rounded bg-zinc-100" />
                  ) : (
                    stat.value
                  )}
                </div>
              </div>
              <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart & Top Products */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-zinc-900">近七天交易趋势</h2>
          <div className="h-96 w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            {loading ? (
              <div className="flex h-full items-center justify-center text-zinc-400">加载中...</div>
            ) : salesTrend.length === 0 ? (
              <div className="flex flex-col h-full items-center justify-center text-zinc-400">
                <TrendingUp size={32} className="mb-4 text-zinc-200" />
                <p>暂无趋势数据</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    dx={-10}
                    tickFormatter={(value) => `¥${value}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e4e4e7',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    name="销售额"
                    dataKey="sales"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    name="订单数"
                    dataKey="orders"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-zinc-900">销量排行 Top 5</h2>
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-zinc-400">加载中...</div>
            ) : topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <Trophy size={32} className="mb-4 text-zinc-200" />
                <p>暂无排行数据</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {topProducts.map((product, index) => (
                  <div
                    key={product.product_id}
                    className="flex items-center gap-4 p-4 hover:bg-zinc-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/merchant/product/edit/${product.product_id}`)}
                  >
                    <div className="relative flex shrink-0">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-zinc-100 border border-zinc-200">
                        {product.image_url ? (
                          <img
                            src={getFileUrl(product.image_url)}
                            alt={product.product_name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-300">
                            <Package size={20} />
                          </div>
                        )}
                      </div>
                      <div
                        className={`absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-300' : index === 2 ? 'bg-amber-600' : 'bg-zinc-800'}`}
                      >
                        {index + 1}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-zinc-900">
                        {product.product_name}
                      </h3>
                      <p className="truncate text-xs text-zinc-500">
                        已售 {product.sales_quantity} 件
                      </p>
                    </div>
                    <div className="text-right text-sm font-medium text-indigo-600">
                      ¥{Number(product.sales_amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Products */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">最近更新商品</h2>
            <button
              onClick={() => navigate('/merchant/product/list')}
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              全部商品
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-zinc-400">加载中...</div>
            ) : recentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <PackageSearch size={32} className="mb-4 text-zinc-200" />
                <p>暂无商品数据</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {recentProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/merchant/product/edit/${product.id}`)}
                    className="flex items-center gap-4 p-4 hover:bg-zinc-50 cursor-pointer transition-colors"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 border border-zinc-200">
                      {product.image_url ? (
                        <img
                          src={getFileUrl(product.image_url)}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-300">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="truncate text-sm font-medium text-zinc-900">
                          {product.name}
                        </h3>
                        <p className="truncate text-xs text-zinc-500">库存: {product.stock}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-zinc-900">
                          ¥{Number(product.price).toFixed(2)}
                        </div>
                        <div className="text-xs text-zinc-500">浏览: {product.views_count}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-zinc-900">快捷操作</h2>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3">
              <button
                onClick={() => navigate('/merchant/product/create')}
                className="flex w-full items-center gap-3 rounded-xl bg-zinc-50 p-3 text-left transition-colors hover:bg-indigo-50 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 group-hover:ring-indigo-200 group-hover:text-indigo-600 transition-all">
                  <Plus size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900 group-hover:text-indigo-700">
                    发布新商品
                  </div>
                  <div className="text-xs text-zinc-500">上架商品到店铺</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/merchant/settings')}
                className="flex w-full items-center gap-3 rounded-xl bg-zinc-50 p-3 text-left transition-colors hover:bg-indigo-50 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 group-hover:ring-indigo-200 group-hover:text-indigo-600 transition-all">
                  <Settings size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900 group-hover:text-indigo-700">
                    店铺设置
                  </div>
                  <div className="text-xs text-zinc-500">管理您的商家资料</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
