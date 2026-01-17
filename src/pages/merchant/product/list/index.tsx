import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Eye, EyeOff, PackageSearch, Loader2, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { productService } from '@/features/product/service'
import type { Product, ProductQueryParams } from '@/features/product/types'
import { useDebounce } from '@/hooks/useDebounce'

export default function ProductList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)

  // 查询状态
  const [queryParams, setQueryParams] = useState<ProductQueryParams>({
    page: 1,
    page_size: 10,
    keyword: '',
    status: undefined,
  })

  // 搜索防抖
  const debouncedKeyword = useDebounce(queryParams.keyword, 1000)

  // 监听参数变化重新加载
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await productService.getList({
          ...queryParams,
          keyword: debouncedKeyword, // 使用防抖后的关键字
        })
        setProducts(res.items)
        setTotal(res.total)
      } catch (err) {
        console.error(err)
        toast.error('获取商品列表失败')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [queryParams, debouncedKeyword])

  // 处理上下架
  const handleStatusChange = async (product: Product) => {
    const newStatus = product.status === 'on' ? 'off' : 'on'
    try {
      await productService.updateStatus(product.id, { status: newStatus })
      toast.success(newStatus === 'on' ? '商品已上架' : '商品已下架')
      // 乐观更新 UI
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p)),
      )
    } catch {
      toast.error('操作失败')
    }
  }

  // 辅助变量以处理可选类型
  const currentPage = queryParams.page || 1
  const pageSize = queryParams.page_size || 10

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">商品管理</h1>
          <p className="mt-1 text-sm text-zinc-500">共 {total} 个商品</p>
        </div>
        <button
          onClick={() => navigate('/merchant/product/create')}
          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md active:scale-95"
        >
          <Plus size={20} />
          新建商品
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="搜索商品名称、SKU..."
            value={queryParams.keyword || ''}
            onChange={(e) => setQueryParams({ ...queryParams, keyword: e.target.value, page: 1 })}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={queryParams.status || ''}
              onChange={(e) =>
                setQueryParams({
                  ...queryParams,
                  status: (e.target.value as Product['status']) || undefined,
                  page: 1,
                })
              }
              className="h-10 appearance-none rounded-xl border border-zinc-200 bg-white pl-4 pr-10 text-sm font-medium text-zinc-700 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-zinc-300"
            >
              <option value="">全部状态</option>
              <option value="on">上架中</option>
              <option value="off">已下架</option>
            </select>
            <Filter className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-zinc-50/50 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">商品信息</th>
                <th className="px-6 py-4 font-medium">价格</th>
                <th className="px-6 py-4 font-medium">库存</th>
                <th className="px-6 py-4 font-medium">销量/浏览</th>
                <th className="px-6 py-4 font-medium">状态</th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-zinc-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-zinc-400">
                      <PackageSearch className="h-10 w-10 text-zinc-300" />
                      <span>暂无商品，点击右上角新建</span>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="group transition-colors hover:bg-zinc-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-300">
                              <PackageSearch size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900 line-clamp-1">
                            {product.name}
                          </div>
                          {product.sku && (
                            <div className="text-xs text-zinc-400">SKU: {product.sku}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-zinc-900">
                        ¥{Number(product.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          product.stock < 10 ? 'text-rose-500 font-medium' : 'text-zinc-600'
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {product.sales_count} / {product.views_count}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.status === 'on'
                            ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20'
                            : 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-500/20'
                        }`}
                      >
                        {product.status === 'on' ? '上架中' : '已下架'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleStatusChange(product)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600"
                          title={product.status === 'on' ? '下架商品' : '上架商品'}
                        >
                          {product.status === 'on' ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        <button
                          onClick={() => navigate(`/merchant/product/edit/${product.id}`)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600"
                          title="编辑商品"
                        >
                          <Edit size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-6 py-4">
            <div className="text-sm text-zinc-500">
              第 {currentPage} / {Math.ceil(total / pageSize)} 页
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setQueryParams((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                className="rounded-lg border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button
                disabled={currentPage * pageSize >= total}
                onClick={() => setQueryParams((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                className="rounded-lg border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
