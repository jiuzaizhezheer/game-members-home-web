import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Heart,
  Flag,
  Loader2,
  ArrowLeft,
  Archive,
  Package,
  MessageSquare,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { productService } from '@/features/product/service'
import { cartService } from '@/features/cart/service'
import { favoriteService } from '@/features/favorite/service'
import { useAuth } from '@/contexts/AuthContext'
import type { ProductPublicOut } from '@/features/product/types'
import { getFileUrl } from '@/shared/utils/file'
import ReportModal from '@/components/common/ReportModal'
import { ReviewList } from '@/features/review/components/ReviewList'
import { Star } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state: authState } = useAuth()

  const [product, setProduct] = useState<ProductPublicOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await productService.getPublicDetail(id)
        setProduct(res)
      } catch (error) {
        console.error('Failed to fetch product detail', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  // 检查收藏状态
  useEffect(() => {
    if (!id || !authState.isAuthenticated) return
    favoriteService
      .check(id)
      .then((res) => setIsFavorited(res.is_favorited))
      .catch(() => {})
  }, [id, authState.isAuthenticated])

  const toggleFavorite = async () => {
    if (!authState.isAuthenticated) {
      toast.error('请先登录')
      return
    }
    if (!id) return

    setFavLoading(true)
    try {
      if (isFavorited) {
        await favoriteService.remove(id)
        setIsFavorited(false)
      } else {
        await favoriteService.add(id)
        setIsFavorited(true)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setFavLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!authState.isAuthenticated) {
      toast.error('请先登录')
      return
    }
    if (!product) return

    setAdding(true)
    try {
      await cartService.addItem({
        product_id: product.id,
        quantity,
      })
    } catch (error) {
      console.error('Failed to add item to cart', error)
    } finally {
      setAdding(false)
    }
  }

  const [buyingNow, setBuyingNow] = useState(false)

  const calculatePrice = () => {
    if (!product || !product.active_promotion) return product ? Number(product.price) : 0

    const { discount_type, discount_value } = product.active_promotion
    const originalPrice = Number(product.price)

    if (discount_type === 'percent') {
      const rate = (100 - Number(discount_value)) / 100
      return Math.max(0, originalPrice * rate)
    } else {
      return Math.max(0.01, originalPrice - Number(discount_value))
    }
  }

  const finalPrice = calculatePrice()
  const hasPromotion = product && !!product.active_promotion

  const handleBuyNow = async () => {
    if (!authState.isAuthenticated) {
      toast.error('请先登录')
      return
    }
    if (!product) return

    setBuyingNow(true)
    navigate('/member/checkout', {
      state: {
        buyNowItem: {
          product_id: product.id,
          product_name: product.name,
          product_image: product.image_url,
          unit_price: finalPrice,
          quantity,
        },
      },
    })
  }

  const handleContactMerchant = () => {
    if (!authState.isAuthenticated) {
      toast.error('请先登录')
      return
    }
    if (!product) return

    const targetId = product.merchant_user_id || product.merchant_id
    navigate(`/member/messages/${targetId}?product_id=${product.id}`, {
      state: {
        refProduct: {
          id: product.id,
          name: product.name,
          price: finalPrice,
          image: product.image_url,
        },
      },
    })
  }

  const handleQuantityChange = (delta: number) => {
    if (!product) return
    const newQty = quantity + delta
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
          <Archive className="h-8 w-8 text-zinc-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">商品未找到</h2>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">该商品可能已下架或不存在</p>
        </div>
        <button
          onClick={() => navigate('/member/home')}
          className="mt-4 rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          返回商城
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft size={14} />
        返回列表
      </button>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
        {/* Image Gallery Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="overflow-hidden rounded-xl"
        >
          <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-800">
            {hasPromotion && (
              <div className="absolute top-4 left-4 z-10 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                {product.active_promotion?.discount_type === 'percent'
                  ? `${Number((100 - product.active_promotion.discount_value) / 10)
                      .toFixed(1)
                      .replace(/\.0$/, '')}折`
                  : `直降 ¥${product.active_promotion?.discount_value}`}
              </div>
            )}

            {product.image_url ? (
              <img
                src={getFileUrl(product.image_url)}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-600">
                <Package size={48} />
              </div>
            )}

            {/* Wishlist/Report Floating Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={toggleFavorite}
                disabled={favLoading}
                className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all ${
                  isFavorited
                    ? 'bg-rose-50/90 text-rose-500 hover:bg-rose-100/90'
                    : 'bg-white/90 text-zinc-600 hover:bg-rose-50 hover:text-rose-500 dark:bg-zinc-800/90 dark:text-zinc-400'
                }`}
              >
                <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
              </motion.button>
              {authState.isAuthenticated && (
                <button
                  onClick={() => setReportOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-sm backdrop-blur-sm transition-all hover:bg-rose-50 hover:text-rose-600 dark:bg-zinc-800/90 dark:text-zinc-400 dark:hover:bg-zinc-700/90 dark:hover:text-rose-400"
                >
                  <Flag size={16} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Product Info Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          {/* Header */}
          <div className="border-b border-zinc-200 pb-4">
            <h1 className="text-xl font-bold text-zinc-950 sm:text-2xl">{product.name}</h1>
            {hasPromotion ? (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-emerald-600">活动价</span>
                    <p className="text-3xl font-bold text-emerald-600">
                      <span className="text-lg">¥</span>
                      {finalPrice.toFixed(2)}
                    </p>
                    <div className="ml-2 flex flex-col items-start gap-0.5">
                      <span className="text-xs text-black line-through">
                        ¥{Number(product.price).toFixed(2)}
                      </span>
                      <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white">
                        {product.active_promotion?.discount_type === 'percent'
                          ? `${Number((100 - product.active_promotion.discount_value) / 10)
                              .toFixed(1)
                              .replace(/\.0$/, '')}折`
                          : `直降 ¥${product.active_promotion?.discount_value}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <span className="font-bold">已省</span>
                    <span className="font-bold">
                      ¥{(Number(product.price) - finalPrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-3 w-px bg-emerald-200 dark:bg-emerald-800" />
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    {product.active_promotion?.title}
                  </span>
                  <div className="h-3 w-px bg-emerald-200 dark:bg-emerald-800" />
                  <span className="text-emerald-600/80 dark:text-emerald-500/80">
                    有效期: {new Date(product.active_promotion!.start_at).toLocaleDateString()} -{' '}
                    {new Date(product.active_promotion!.end_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-baseline gap-3">
                <p className="text-2xl font-bold text-zinc-950">¥{finalPrice.toFixed(2)}</p>
              </div>
            )}

            <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-zinc-950">{product.sales_count}</span>
                <span>人已付款</span>
              </div>
              <div className="h-2.5 w-px bg-zinc-200" />
              <div className="flex items-center gap-1">
                <span>库存</span>
                <span className="font-semibold text-zinc-950">{product.stock}</span>
              </div>

              {/* Reviews Summary */}
              {product.review_count !== undefined && product.review_count > 0 && (
                <>
                  <div className="h-2.5 w-px bg-zinc-200" />
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => {
                      document
                        .getElementById('reviews-section')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="font-semibold text-zinc-950">
                      {Number(product.rating).toFixed(1)}
                    </span>
                    <span>({product.review_count}条评价)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="py-4">
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">商品描述</h3>
            <div className="mt-3 prose prose-sm prose-zinc max-w-none">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {product.description || '暂无详细描述'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-4">
            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="text-xs font-medium text-zinc-900 dark:text-white">数量</label>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 space-x-1">
                  {product.stock > 0 ? (
                    product.stock < 10 ? (
                      <span className="text-rose-500">仅剩 {product.stock} 件</span>
                    ) : (
                      <span>库存充足</span>
                    )
                  ) : (
                    <span className="text-rose-500">暂时缺货</span>
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Contact Merchant Button */}
              <button
                onClick={handleContactMerchant}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 sm:h-auto sm:w-16 sm:px-0 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50 dark:focus:ring-offset-zinc-900"
                title="联系客服"
              >
                <MessageSquare size={20} />
                <span className="sr-only sm:not-sr-only sm:ml-1 sm:text-xs sm:font-medium">
                  联系客服
                </span>
              </button>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none sm:px-6 sm:py-3 sm:text-sm dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart size={16} />}
                {product.stock === 0 ? '暂时缺货' : adding ? '正在添加...' : '加入购物车'}
              </button>
              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0 || adding || buyingNow}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none sm:px-6 sm:py-3 sm:text-sm dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
              >
                {buyingNow ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {buyingNow ? '正在处理...' : '立即购买'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <div id="reviews-section" className="mt-12">
        <div className="border-b border-zinc-200 pb-4 mb-6">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            商品评价
            <span className="text-sm font-medium text-zinc-500 ml-2">
              (共 {product.review_count || 0} 条)
            </span>
          </h2>
        </div>
        <div className="max-w-3xl">
          <ReviewList productId={product.id} />
        </div>
      </div>
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="product"
        targetId={product.id}
      />
    </div>
  )
}
