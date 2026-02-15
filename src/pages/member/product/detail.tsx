import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Share2, Loader2, ArrowLeft, Archive, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { productService } from '@/features/product/service'
import { cartService } from '@/features/cart/service'
import { useAuth } from '@/contexts/AuthContext'
import type { ProductPublicOut } from '@/features/product/types'
import { getFileUrl } from '@/shared/utils/file'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state: authState } = useAuth()

  const [product, setProduct] = useState<ProductPublicOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await productService.getPublicDetail(id)
        setProduct(res)
      } catch (error) {
        console.error('Failed to fetch product detail', error)
        toast.error('获取商品详情失败')
        // navigate('/member/home') // Optional: redirect on error
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!authState.isAuthenticated) {
      toast.error('请先登录', {
        description: '您需要登录后才能将商品加入购物车',
        action: {
          label: '立即登录',
          onClick: () => navigate('/auth/login'),
        },
      })
      return
    }

    if (!product) return

    setAdding(true)
    try {
      await cartService.addItem({
        product_id: product.id,
        quantity: quantity,
      })
      toast.success('已加入购物车', {
        description: `已将 ${quantity} 件 ${product.name} 加入购物车`,
        action: {
          label: '前往购物车',
          onClick: () => navigate('/member/cart'),
        },
      })
    } catch (error) {
      console.error('Failed to add item to cart', error)
      toast.error(error instanceof Error ? error.message : '加入购物车失败')
    } finally {
      setAdding(false)
    }
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
          className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-800">
            {product.image_url ? (
              <img
                src={getFileUrl(product.image_url)}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-600">
                <Package size={48} />
              </div>
            )}

            {/* Wishlist/Share Floating Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-sm backdrop-blur-sm transition-all hover:bg-rose-50 hover:text-rose-500 dark:bg-zinc-800/90 dark:text-zinc-400 dark:hover:bg-zinc-700/90 dark:hover:text-rose-400">
                <Heart size={16} />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-sm backdrop-blur-sm transition-all hover:bg-indigo-50 hover:text-indigo-500 dark:bg-zinc-800/90 dark:text-zinc-400 dark:hover:bg-zinc-700/90 dark:hover:text-indigo-400">
                <Share2 size={16} />
              </button>
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
            <div className="mt-3 flex items-end gap-3">
              <p className="text-2xl font-bold text-zinc-950">
                ¥{Number(product.price).toFixed(2)}
              </p>
            </div>
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
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none sm:px-6 sm:py-3 sm:text-sm dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart size={16} />}
                {product.stock === 0 ? '暂时缺货' : adding ? '正在添加...' : '加入购物车'}
              </button>
              {/* Buy Now Button (Optional) */}
              <button
                disabled={product.stock === 0 || adding}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-3 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                立即购买
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
