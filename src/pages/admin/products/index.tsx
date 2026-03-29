import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Package, Search, Filter, Eye, EyeOff, PackageSearch, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { adminApi } from '@/features/admin/api'
import type { AdminProductItem } from '@/features/admin/types'
import { useDebounce } from '@/hooks/useDebounce'
import { useConfirm } from '@/components/ui/confirmContext'
import { getFileUrl } from '@/shared/utils/file'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const confirm = useConfirm()

  const [page, setPage] = useState(1)
  const pageSize = 15
  const [searchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [statusFilter, setStatusFilter] = useState('')
  const debouncedKeyword = useDebounce(keyword, 600)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminApi.getProducts({
        page,
        page_size: pageSize,
        keyword: debouncedKeyword || undefined,
        status: statusFilter || undefined,
      })
      setProducts(res.items)
      setTotal(res.total)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedKeyword, statusFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleForceOffline = async (product: AdminProductItem) => {
    if (product.status === 'off') return
    if (
      !(await confirm({
        title: '强制下架',
        description: `确定要强制下架商品 "${product.name}" 吗？`,
        confirmText: '强制下架',
        cancelText: '取消',
        variant: 'danger',
      }))
    )
      return

    try {
      await adminApi.forceOfflineProduct(product.id)
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, status: 'off' } : p)))
    } catch (error) {
      console.error(error)
    }
  }

  const handleForceOnline = async (product: AdminProductItem) => {
    if (product.status === 'on') return
    if (
      !(await confirm({
        title: '恢复上架',
        description: `确定要恢复商品 "${product.name}" 上架吗？`,
        confirmText: '恢复上架',
        cancelText: '取消',
        variant: 'default',
      }))
    )
      return

    try {
      await adminApi.forceOnlineProduct(product.id)
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, status: 'on' } : p)))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">商品管理</h1>
          <p className="mt-1 text-sm text-zinc-500">全平台共 {total} 个商品</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <Package size={20} className="text-amber-600" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="搜索商品名称..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="h-10 appearance-none rounded-xl border border-zinc-200 bg-white pl-4 pr-9 text-sm font-medium text-zinc-700 outline-none transition-all focus:border-indigo-500 hover:border-zinc-300"
          >
            <option value="">全部状态</option>
            <option value="on">上架中</option>
            <option value="off">已下架</option>
          </select>
          <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-zinc-50/80 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">商品信息</th>
                <th className="px-6 py-4 font-medium">价格</th>
                <th className="px-6 py-4 font-medium">库存</th>
                <th className="px-6 py-4 font-medium">销量</th>
                <th className="px-6 py-4 font-medium">状态</th>
                <th className="px-6 py-4 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                      <PackageSearch className="h-10 w-10 text-zinc-200" />
                      <span>暂无商品数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group transition-colors hover:bg-zinc-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                          {product.image_url ? (
                            <img
                              src={getFileUrl(product.image_url)}
                              alt={product.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-300">
                              <PackageSearch size={16} />
                            </div>
                          )}
                        </div>
                        <span className="line-clamp-1 font-medium text-zinc-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900">
                      ¥{Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          product.stock < 10 ? 'font-medium text-rose-500' : 'text-zinc-600'
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{product.sales_count}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          product.status === 'on'
                            ? 'bg-emerald-50 text-emerald-600 ring-emerald-500/20'
                            : 'bg-zinc-100 text-zinc-500 ring-zinc-500/20'
                        }`}
                      >
                        {product.status === 'on' ? '上架中' : '已下架'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {product.status === 'on' ? (
                        <button
                          onClick={() => handleForceOffline(product)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500 ml-auto"
                          title="强制下架"
                        >
                          <Eye size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleForceOnline(product)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-emerald-50 hover:text-emerald-500 ml-auto"
                          title="恢复上架"
                        >
                          <EyeOff size={16} />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-6 py-4">
            <div className="text-sm text-zinc-500">
              第 {page} / {Math.ceil(total / pageSize)} 页，共 {total} 条
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                上一页
              </button>
              <button
                disabled={page * pageSize >= total}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
