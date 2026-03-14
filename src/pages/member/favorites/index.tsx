import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, Loader2, PackageSearch, CheckSquare, Square, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { favoriteService } from '@/features/favorite/service'
import type { FavoriteItemOut } from '@/features/favorite/types'
import { getFileUrl } from '@/shared/utils/file'
import { useConfirm } from '@/components/ui/confirmContext'

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItemOut[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [removing, setRemoving] = useState(false)
  const confirm = useConfirm()

  const fetchFavorites = useCallback(
    async (p = page) => {
      setLoading(true)
      try {
        const res = await favoriteService.getList(p, pageSize)
        setItems(res.items)
        setTotal(res.total)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize],
  )

  useEffect(() => {
    fetchFavorites(page)
  }, [fetchFavorites, page])

  const toggleSelect = (productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((i) => i.product_id)))
    }
  }

  const handleRemoveSingle = async (productId: string) => {
    const confirmed = await confirm({
      title: '取消收藏',
      description: '确定要取消收藏该商品吗？',
      confirmText: '取消收藏',
      cancelText: '再想想',
      variant: 'warning',
    })
    if (!confirmed) return

    try {
      await favoriteService.remove(productId)
      fetchFavorites()
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveBatch = async () => {
    if (selectedIds.size === 0) return

    const confirmed = await confirm({
      title: '批量取消收藏',
      description: `确定要取消收藏已选的 ${selectedIds.size} 件商品吗？`,
      confirmText: '确定',
      cancelText: '再想想',
      variant: 'warning',
    })
    if (!confirmed) return

    setRemoving(true)
    try {
      await favoriteService.removeBatch(Array.from(selectedIds))
      setSelectedIds(new Set())
      fetchFavorites()
    } catch (error) {
      console.error(error)
    } finally {
      setRemoving(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-2 pb-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">我的收藏</h2>
          <p className="mt-1 text-sm text-zinc-500">已收藏 {total} 件商品</p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              {selectedIds.size === items.length ? (
                <CheckSquare className="h-4 w-4 text-indigo-500" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              全选
            </button>

            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleRemoveBatch}
                  disabled={removing}
                  className="flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
                >
                  {removing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  取消收藏 ({selectedIds.size})
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-zinc-50 p-4">
            <Heart className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900">暂无收藏</h3>
          <p className="mt-1 text-sm text-zinc-500">去逛逛商城，收藏喜欢的商品吧</p>
          <Link
            to="/member/home"
            className="mt-4 rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
          >
            去逛逛
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-y-4 gap-x-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 xl:gap-x-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.product_id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`group relative flex flex-col overflow-hidden rounded-xl bg-white border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    selectedIds.has(item.product_id)
                      ? 'border-indigo-400 ring-2 ring-indigo-100'
                      : 'border-zinc-200'
                  }`}
                >
                  {/* Select Checkbox */}
                  <button
                    onClick={() => toggleSelect(item.product_id)}
                    className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:bg-white"
                  >
                    {selectedIds.has(item.product_id) ? (
                      <CheckSquare className="h-4 w-4 text-indigo-500" />
                    ) : (
                      <Square className="h-4 w-4 text-zinc-400" />
                    )}
                  </button>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveSingle(item.product_id)}
                    className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-zinc-400 shadow-sm backdrop-blur-sm opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>

                  {/* Off-shelf Badge */}
                  {item.product_status === 'off' && (
                    <div className="absolute inset-0 z-[5] flex items-center justify-center bg-zinc-900/40 backdrop-blur-[2px]">
                      <span className="rounded-full bg-zinc-800/80 px-3 py-1 text-xs font-medium text-white">
                        已下架
                      </span>
                    </div>
                  )}

                  <Link to={`/member/product/${item.product_id}`} className="flex flex-col flex-1">
                    <div className="aspect-square w-full overflow-hidden bg-zinc-100">
                      {item.product_image ? (
                        <img
                          src={getFileUrl(item.product_image)}
                          alt={item.product_name}
                          loading="lazy"
                          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-300">
                          <PackageSearch size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-2">
                      <h3 className="text-xs font-medium text-zinc-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {item.product_name}
                      </h3>
                      <div className="mt-auto pt-2">
                        <p className="text-sm font-bold text-zinc-900">
                          ¥{Number(item.product_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40"
              >
                上一页
              </button>
              <span className="text-sm text-zinc-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
