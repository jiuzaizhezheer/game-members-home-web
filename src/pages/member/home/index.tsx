import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, PackageSearch } from 'lucide-react'
import { motion } from 'framer-motion'
import { productService } from '@/features/product/service'
import { categoryApi } from '@/features/category/api'
import type { ProductPublicOut } from '@/features/product/types'
import type { CategoryOut } from '@/features/category/types'
import { useDebounce } from '@/hooks/useDebounce'
import { getFileUrl } from '@/shared/utils/file'
import Skeleton from '@/components/ui/Skeleton'

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const keywordFromUrl = searchParams.get('keyword') || ''
  const categoryIdFromUrl = searchParams.get('category_id') || ''

  const [products, setProducts] = useState<ProductPublicOut[]>([])
  const [loading, setLoading] = useState(true)
  type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popularity_desc'
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [keyword, setKeyword] = useState(keywordFromUrl)
  const [prevKeywordFromUrl, setPrevKeywordFromUrl] = useState(keywordFromUrl)

  // 分类状态
  const [categories, setCategories] = useState<CategoryOut[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryIdFromUrl)

  // 同步 URL 关键词到本地状态
  if (keywordFromUrl !== prevKeywordFromUrl) {
    setPrevKeywordFromUrl(keywordFromUrl)
    setKeyword(keywordFromUrl)
  }

  const debouncedKeyword = useDebounce(keyword, 500)

  // 获取分类列表
  useEffect(() => {
    categoryApi
      .getAll()
      .then((res) => setCategories(res))
      .catch(() => {})
  }, [])

  // 同步 URL 中的 category_id
  useEffect(() => {
    setSelectedCategoryId(categoryIdFromUrl)
  }, [categoryIdFromUrl])

  // 热门排行榜状态
  const [trendingProducts, setTrendingProducts] = useState<ProductPublicOut[]>([])
  const [loadingTrending, setLoadingTrending] = useState(true)

  // 获取热门排行榜 (固定按人气倒序，前5名)
  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true)
      try {
        const res = await productService.getPublicList({
          page: 1,
          page_size: 5,
          sort_by: 'popularity_desc',
        })
        setTrendingProducts(res.items)
      } catch (error) {
        console.error('Failed to fetch trending products', error)
      } finally {
        setLoadingTrending(false)
      }
    }

    fetchTrending()
  }, [])

  // 获取商品列表
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await productService.getPublicList({
          page: 1,
          page_size: 20,
          keyword: debouncedKeyword,
          sort_by: sortBy,
          category_id: selectedCategoryId || undefined,
        })
        setProducts(res.items)
      } catch (error) {
        console.error('Failed to fetch products', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [debouncedKeyword, sortBy, selectedCategoryId])

  const handleCategoryChange = (categoryId: string) => {
    const newId = categoryId === selectedCategoryId ? '' : categoryId
    setSelectedCategoryId(newId)

    // 同步到 URL
    const newParams = new URLSearchParams(searchParams)
    if (newId) {
      newParams.set('category_id', newId)
    } else {
      newParams.delete('category_id')
    }
    setSearchParams(newParams, { replace: true })
  }

  // 只显示一级分类（parent_id 为 null 的）
  const topCategories = categories.filter((c) => !c.parent_id)

  const calculatePrice = (product: ProductPublicOut) => {
    if (!product.active_promotion) return Number(product.price)

    const { discount_type, discount_value } = product.active_promotion
    const originalPrice = Number(product.price)

    if (discount_type === 'percent') {
      const rate = (100 - Number(discount_value)) / 100
      return Math.max(0, originalPrice * rate)
    } else {
      return Math.max(0.01, originalPrice - Number(discount_value))
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-2 pb-16 sm:px-6 lg:px-8">
      {/* Category Tabs */}
      {topCategories.length > 0 && (
        <div className="mb-4 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={() => handleCategoryChange('')}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !selectedCategoryId
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              全部
            </button>
            {topCategories.map((category) => (
              <motion.button
                key={category.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryChange(category.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  selectedCategoryId === category.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Leaderboard (Only show when not searching/filtering by category) */}
      {!keywordFromUrl && !selectedCategoryId && trendingProducts.length > 0 && (
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900">
              <span className="text-xl">🔥</span> 人气热销榜
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {loadingTrending
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-xl bg-zinc-100 animate-pulse" />
                ))
              : trendingProducts.map((product, index) => {
                  const finalPrice = calculatePrice(product)
                  return (
                    <Link
                      key={product.id}
                      to={`/member/product/${product.id}`}
                      className="group relative flex overflow-hidden rounded-xl bg-white border border-rose-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 hover:border-rose-300"
                    >
                      {/* Rank Badge */}
                      <div
                        className={`absolute top-0 left-0 z-10 rounded-br-xl px-3 py-1 text-xs font-bold text-white shadow-sm ${
                          index === 0
                            ? 'bg-linear-to-r from-amber-400 to-amber-500' // Top 1 Gold
                            : index === 1
                              ? 'bg-linear-to-r from-slate-300 to-slate-400' // Top 2 Silver
                              : index === 2
                                ? 'bg-linear-to-r from-amber-700 to-amber-800' // Top 3 Bronze
                                : 'bg-zinc-800'
                        }`}
                      >
                        TOP {index + 1}
                      </div>

                      <div className="flex w-full flex-col">
                        <div className="aspect-square w-full overflow-hidden bg-zinc-100 relative">
                          {product.image_url ? (
                            <img
                              src={getFileUrl(product.image_url)}
                              alt={product.name}
                              loading="lazy"
                              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-300">
                              <PackageSearch size={24} />
                            </div>
                          )}
                          {/* Overlay gradient for readability */}
                          <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
                          <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-1">
                            {product.name}
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-zinc-50 p-3 flex-1">
                          <div className="flex flex-col">
                            <span className="text-zinc-500 text-[10px]">
                              综合热度 {product.popularity_score}
                            </span>
                            <span className="text-rose-600 font-bold text-sm">
                              ¥{finalPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-xs transition-colors group-hover:bg-rose-600 group-hover:text-white">
                            <span className="text-xs font-bold text-center">抢</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
          </div>
        </div>
      )}

      {/* Filter & Sort Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-zinc-900">
          {keywordFromUrl
            ? `"${keywordFromUrl}" 的搜索结果`
            : selectedCategoryId
              ? `${topCategories.find((c) => c.id === selectedCategoryId)?.name || '分类'}商品`
              : '精选商品'}
        </h2>

        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 text-sm font-medium text-zinc-700 outline-none transition-all hover:border-zinc-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="newest">最新上架</option>
              <option value="price_asc">价格从低到高</option>
              <option value="price_desc">价格从高到低</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <Skeleton.ProductGrid count={12} />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-zinc-50 p-4">
            <PackageSearch className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900">暂无商品</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {keywordFromUrl ? '换个关键词试试看？' : '商家正在努力上货中...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-4 gap-x-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 xl:gap-x-4">
          {products.map((product) => {
            const finalPrice = calculatePrice(product)
            const hasPromotion = !!product.active_promotion

            return (
              <Link
                key={product.id}
                to={`/member/product/${product.id}`}
                className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-zinc-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                {hasPromotion && (
                  <div className="absolute top-2 left-2 z-10 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {product.active_promotion?.discount_type === 'percent'
                      ? `${Number((100 - product.active_promotion.discount_value) / 10)
                          .toFixed(1)
                          .replace(/\.0$/, '')}折`
                      : `直降 ¥${product.active_promotion?.discount_value}`}
                  </div>
                )}

                <div className="aspect-square w-full overflow-hidden bg-zinc-100">
                  {product.image_url ? (
                    <img
                      src={getFileUrl(product.image_url)}
                      alt={product.name}
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
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`text-sm font-bold ${hasPromotion ? 'text-rose-600' : 'text-zinc-900'}`}
                        >
                          ¥{finalPrice.toFixed(2)}
                        </span>
                        {hasPromotion && (
                          <span className="text-[10px] text-zinc-400 line-through">
                            ¥{Number(product.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400">{product.sales_count}人付款</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
