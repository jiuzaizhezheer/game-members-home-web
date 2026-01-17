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
} from 'lucide-react'
import { toast } from 'sonner'

import { productService } from '@/features/product/service'
import type { Product } from '@/features/product/types'

export default function MerchantWorkbench() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    productsCount: 0,
    totalViews: 0,
    totalSales: 0,
  })
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取商品列表（第一页，主要为了获取总数和最新的几个）
        const res = await productService.getList({ page: 1, page_size: 5 })

        // 简单的统计聚合（实际应该由专门的统计 API 提供）
        const totalViews = res.items.reduce((acc, curr) => acc + curr.views_count, 0) // 这里其实不准确，因为只算了第一页，暂且用来演示
        const totalSales = res.items.reduce((acc, curr) => acc + curr.sales_count, 0)
        // TODO 後續請求api獲取今日成交 (预估)
        setStats({
          productsCount: res.total,
          totalViews: totalViews, // Note: 仅演示
          totalSales: totalSales, // Note: 仅演示
        })
        setRecentProducts(res.items)
      } catch (error) {
        console.error(error)
        toast.error('加载工作台数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statCards = [
    {
      label: '商品总数',
      value: stats.productsCount,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: '总销量 (件)',
      value: stats.totalSales,
      icon: ShoppingBag,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: '累计浏览',
      value: stats.totalViews,
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: '今日成交 (预估)',
      value: '¥0.00',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ]

  return (
    <div className="space-y-8">
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
                    <div className="h-8 w-16 animate-pulse rounded bg-zinc-100" />
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
                <PackageSearch size={20} className="mb-4 text-zinc-200" />
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
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-300">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-zinc-900">{product.name}</h3>
                      <p className="truncate text-xs text-zinc-500">
                        ¥{Number(product.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right text-xs text-zinc-500">库存: {product.stock}</div>
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
                    店铺装修
                  </div>
                  <div className="text-xs text-zinc-500">修改店铺名称及简介</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
