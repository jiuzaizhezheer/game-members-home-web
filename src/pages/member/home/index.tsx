import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, PackageSearch } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { productService } from '@/features/product/service'
import { categoryApi } from '@/features/category/api'
import type { ProductPublicOut } from '@/features/product/types'
import type { CategoryOut } from '@/features/category/types'
import { useDebounce } from '@/hooks/useDebounce'
import { getFileUrl } from '@/shared/utils/file'
import Skeleton from '@/components/ui/Skeleton'
import { commonApi, type BannerOut } from '@/features/common/api'
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Ticket,
  LayoutGrid,
  Coins,
} from 'lucide-react'

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

  // 轮播图状态
  const [banners, setBanners] = useState<BannerOut[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  useEffect(() => {
    commonApi
      .getBanners()
      .then(setBanners)
      .catch(() => {})
  }, [])

  // 自动轮播
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

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
      {/* Hero Section: Banner + Trending Sidebar */}
      {!keywordFromUrl && !selectedCategoryId && (
        <div className="mb-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Banner (2/3 width on desktop) */}
          <div className="lg:col-span-8">
            {banners.length > 0 && (
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBannerIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative h-full w-full"
                  >
                    <img
                      src={getFileUrl(banners[currentBannerIndex].image_url)}
                      alt={banners[currentBannerIndex].title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-8 right-8">
                      <motion.h3
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-white sm:text-3xl tracking-tight"
                      >
                        {banners[currentBannerIndex].title}
                      </motion.h3>
                      {banners[currentBannerIndex].link_url && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="mt-4"
                        >
                          <Link
                            to={banners[currentBannerIndex].link_url!}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
                          >
                            立即查看
                            <ChevronRight size={14} />
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {banners.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentBannerIndex(
                          (prev) => (prev - 1 + banners.length) % banners.length,
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-90 border border-white/10"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-90 border border-white/10"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-4 right-8 flex gap-1.5">
                      {banners.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentBannerIndex(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBannerIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Trending Sidebar (1/3 width on desktop) */}
          <div className="hidden lg:block lg:col-span-4 relative">
            <div className="absolute inset-0 rounded-3xl bg-zinc-50/50 border border-zinc-200/50 p-6 shadow-sm overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl" />

              <div className="mb-4 flex items-center justify-between shrink-0">
                <h3 className="flex items-center gap-2 text-base font-bold text-zinc-900 tracking-tight">
                  <TrendingUp size={18} className="text-indigo-500" />
                  人气热销榜
                </h3>
                <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  <Sparkles size={10} />
                  Live
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-hidden">
                {loadingTrending
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="h-14 w-14 shrink-0 rounded-xl bg-zinc-200" />
                        <div className="flex flex-1 flex-col justify-center space-y-2">
                          <div className="h-3 w-2/3 rounded-full bg-zinc-200" />
                          <div className="h-4 w-1/3 rounded-full bg-zinc-200" />
                        </div>
                      </div>
                    ))
                  : trendingProducts.slice(0, 3).map((product, index) => {
                      const finalPrice = calculatePrice(product)
                      return (
                        <Link
                          key={product.id}
                          to={`/member/product/${product.id}`}
                          className="group flex gap-3 p-1.5 -mx-1.5 rounded-2xl transition-all hover:bg-white hover:shadow-md hover:shadow-zinc-200/50"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-white">
                            <img
                              src={getFileUrl(product.image_url)}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div
                              className={`absolute top-0 left-0 flex h-5 w-5 items-center justify-center rounded-br-lg text-[10px] font-bold text-white shadow-sm ${
                                index === 0
                                  ? 'bg-amber-400'
                                  : index === 1
                                    ? 'bg-slate-300'
                                    : 'bg-orange-700'
                              }`}
                            >
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col justify-center min-w-0">
                            <h4 className="text-sm font-bold text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">
                              {product.name}
                            </h4>
                            <div className="mt-0.5 flex items-center justify-between">
                              <span className="text-rose-600 font-bold text-sm leading-none">
                                ¥{finalPrice.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                热度 {product.popularity_score}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
              </div>

              <Link
                to="/member/trending"
                className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-2 text-xs font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 shadow-lg shadow-zinc-200 shrink-0"
              >
                查看完整榜单
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Row */}
      {!keywordFromUrl && !selectedCategoryId && (
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          <Link
            to="/member/coupons"
            className="group relative flex items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 active:scale-95 sm:p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100 transition-colors group-hover:bg-rose-500 group-hover:text-white group-hover:ring-rose-500">
              <Ticket size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 sm:text-base">领券中心</h3>
              <p className="mt-0.5 text-[10px] text-zinc-500 sm:text-xs">先领券 再下单</p>
            </div>
            <div className="absolute top-2 right-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[8px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 uppercase tracking-tighter">
              Hot
            </div>
          </Link>

          <Link
            to="/member/profile/points"
            className="group flex items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 active:scale-95 sm:p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 ring-1 ring-amber-100 transition-colors group-hover:bg-amber-500 group-hover:text-white group-hover:ring-amber-500">
              <Coins size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 sm:text-base">积分特权</h3>
              <p className="mt-0.5 text-[10px] text-zinc-500 sm:text-xs">积分兑换好礼</p>
            </div>
          </Link>

          <Link
            to="/member/trending"
            className="group flex items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 active:scale-95 sm:p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 ring-1 ring-indigo-100 transition-colors group-hover:bg-indigo-500 group-hover:text-white group-hover:ring-indigo-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 sm:text-base">人气榜单</h3>
              <p className="mt-0.5 text-[10px] text-zinc-500 sm:text-xs">实时热销尖货</p>
            </div>
          </Link>

          <button
            onClick={() => {
              const el = document.getElementById('category-tabs')
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="group flex items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 active:scale-95 text-left sm:p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100 transition-colors group-hover:bg-emerald-500 group-hover:text-white group-hover:ring-emerald-500">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 sm:text-base">全部分类</h3>
              <p className="mt-0.5 text-[10px] text-zinc-500 sm:text-xs">探索更多商品</p>
            </div>
          </button>
        </div>
      )}
      {/* Category Tabs */}
      {topCategories.length > 0 && (
        <div
          id="category-tabs"
          className="mb-4 -mx-4 px-4 overflow-x-auto scrollbar-hide scroll-mt-20"
        >
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

      {/* Hot Leaderboard (Horizontal Scrolling on Desktop, Grid on Mobile) */}
      {!keywordFromUrl && !selectedCategoryId && trendingProducts.length > 3 && (
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-base">
                🔥
              </span>
              人气热销榜
            </h2>
            <Link
              to="/member/home?sort_by=popularity_desc"
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              查看全部
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {loadingTrending
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-2xl bg-zinc-100 animate-pulse" />
                ))
              : trendingProducts.slice(3, 8).map((product, index) => {
                  const finalPrice = calculatePrice(product)
                  const rank = index + 4
                  return (
                    <Link
                      key={product.id}
                      to={`/member/product/${product.id}`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-zinc-200/80 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 hover:border-zinc-300"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-zinc-100 relative">
                        <img
                          src={getFileUrl(product.image_url)}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900/80 text-[10px] font-bold text-white backdrop-blur-xs">
                          {rank}
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h4 className="text-xs font-bold text-zinc-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h4>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-rose-600 font-bold text-sm">
                            ¥{finalPrice.toFixed(2)}
                          </span>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 transition-all group-hover:bg-rose-600 group-hover:text-white">
                            <ChevronRight size={14} />
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
