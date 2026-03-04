import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Sparkles, ChevronRight, PackageSearch, ArrowLeft } from 'lucide-react'
import { productService } from '@/features/product/service'
import type { ProductPublicOut } from '@/features/product/types'
import { getFileUrl } from '@/shared/utils/file'

export default function TrendingPage() {
  const [products, setProducts] = useState<ProductPublicOut[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true)
      try {
        const res = await productService.getPublicList({
          page: 1,
          page_size: 10,
          sort_by: 'popularity_desc',
        })
        setProducts(res.items)
      } catch (error) {
        console.error('Failed to fetch trending products', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [])

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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col items-center text-center">
        <Link
          to="/member/home"
          className="mb-6 flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-bold text-zinc-500 transition-all hover:bg-zinc-200 hover:text-zinc-900"
        >
          <ArrowLeft size={14} />
          返回首页
        </Link>
        <div className="relative inline-flex items-center justify-center p-1 rounded-2xl bg-indigo-50/50 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-xl shadow-indigo-200">
            <TrendingUp size={24} />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2 flex h-5 w-14 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white px-2 shadow-lg"
          >
            HOT 10
          </motion.div>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
          人气热销排行榜
        </h1>
        <p className="mt-4 max-w-2xl text-base text-zinc-500">
          全站实时热度计算，网罗最受玩家欢迎的高质量游戏商品。排名每小时更新一次，抢手好物不容错过。
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {products.map((product, index) => {
            const finalPrice = calculatePrice(product)
            const isTop3 = index < 3

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/member/product/${product.id}`}
                  className={`group relative flex flex-col sm:flex-row gap-6 p-6 rounded-[2rem] border transition-all hover:shadow-2xl hover:shadow-zinc-200 ${
                    isTop3
                      ? 'bg-white border-zinc-200 shadow-xl'
                      : 'bg-zinc-50/50 border-zinc-100 hover:bg-white'
                  }`}
                >
                  {/* Rank Badge */}
                  <div
                    className={`absolute -left-3 top-6 flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-black text-white shadow-lg ${
                      index === 0
                        ? 'bg-amber-400 rotate-[-12deg]'
                        : index === 1
                          ? 'bg-slate-300 rotate-[-12deg]'
                          : index === 2
                            ? 'bg-orange-700 rotate-[-12deg]'
                            : 'bg-zinc-900 rotate-0'
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Product Image */}
                  <div
                    className={`relative shrink-0 overflow-hidden rounded-2xl border bg-zinc-100 ${
                      isTop3 ? 'h-40 w-full sm:w-40' : 'h-32 w-full sm:w-32'
                    }`}
                  >
                    {product.image_url ? (
                      <img
                        src={getFileUrl(product.image_url)}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-300">
                        <PackageSearch size={32} />
                      </div>
                    )}
                    {isTop3 && (
                      <div className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-1 backdrop-blur-sm">
                        <Sparkles size={12} className="text-amber-500" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">
                          Popularity: {product.popularity_score}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400">
                          已售 {product.sales_count}+
                        </span>
                      </div>
                      <h3
                        className={`font-black text-zinc-900 group-hover:text-indigo-600 transition-colors ${
                          isTop3 ? 'text-xl sm:text-2xl' : 'text-lg'
                        }`}
                      >
                        {product.name}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                        {product.description || '暂无详细描述'}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-rose-600">¥</span>
                        <span
                          className={`font-black text-rose-600 ${isTop3 ? 'text-3xl' : 'text-2xl'}`}
                        >
                          {finalPrice.toFixed(2)}
                        </span>
                        {product.active_promotion && (
                          <span className="ml-2 text-sm text-zinc-400 line-through">
                            ¥{Number(product.price).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button className="flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white transition-all group-hover:bg-indigo-600 group-hover:scale-105 active:scale-95 shadow-xl shadow-zinc-200">
                        立即抢购
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
