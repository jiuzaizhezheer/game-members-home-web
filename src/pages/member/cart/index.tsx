import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Ticket,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cartService } from '@/features/cart/service'
import type { CartOut, CartItemOut } from '@/features/cart/types'
import { getFileUrl } from '@/shared/utils/file'
import { useConfirm } from '@/components/ui/confirmContext'

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const confirm = useConfirm()

  const fetchCart = useCallback(async () => {
    try {
      const data = await cartService.getMyCart()
      setCart(data)
    } catch (error) {
      console.error('Failed to fetch cart', error)
      toast.error('获取购物车失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const handleUpdateQuantity = async (item: CartItemOut, delta: number) => {
    const newQty = item.quantity + delta
    if (newQty < 1) return

    setUpdatingId(item.id)
    try {
      await cartService.updateItem(item.id, { quantity: newQty })
      await fetchCart()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新数量失败')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await cartService.removeItem(itemId)
      toast.success('商品已移除')
      await fetchCart()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '移除商品失败')
    }
  }

  const handleClearCart = async () => {
    const confirmed = await confirm({
      title: '清空购物车',
      description: '确定要清空购物车吗？此操作无法撤销。',
      confirmText: '确定清空',
      cancelText: '取消',
      variant: 'danger',
    })
    if (!confirmed) return
    try {
      await cartService.clearCart()
      toast.success('购物车已清空')
      await fetchCart()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '清空购物车失败')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6 rounded-full bg-zinc-50 p-6">
            <ShoppingCart className="h-12 w-12 text-zinc-300" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">您的购物车是空的</h2>
          <p className="mt-2 text-zinc-500">快去选购一些心仪的商品吧！</p>
          <Link
            to="/member/home"
            className="mt-8 rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
          >
            去逛逛
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <ShoppingBag size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">{cart.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
            购物车 ({cart.total_quantity})
          </h1>
        </div>
        <button
          onClick={handleClearCart}
          className="text-sm font-medium text-zinc-400 hover:text-rose-500 transition-colors"
        >
          清空当前购物车
        </button>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
        {/* Items List */}
        <div className="lg:col-span-8">
          <ul className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
            <AnimatePresence mode="popLayout">
              {cart.items.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex py-6 sm:py-10"
                >
                  <div className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden w-24 h-24 sm:w-32 sm:h-32">
                    {item.product_image ? (
                      <img
                        src={getFileUrl(item.product_image)}
                        alt={item.product_name}
                        loading="lazy"
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-300">
                        <ShoppingBag size={32} />
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm">
                            <Link
                              to={`/member/product/${item.product_id}`}
                              className="font-medium text-zinc-700 hover:text-indigo-600 transition-colors"
                            >
                              {item.product_name}
                            </Link>
                          </h3>
                        </div>

                        <div className="mt-1 flex flex-col items-start gap-1">
                          {item.active_promotion && (
                            <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white">
                              {item.active_promotion.discount_type === 'percent'
                                ? `${Number((100 - item.active_promotion.discount_value) / 10)
                                    .toFixed(1)
                                    .replace(/\.0$/, '')}折`
                                : `直降 ¥${item.active_promotion.discount_value}`}
                            </span>
                          )}

                          <div className="flex items-baseline gap-2">
                            <p className="text-sm font-bold text-emerald-600">
                              ¥{Number(item.unit_price).toFixed(2)}
                            </p>
                            {item.original_price && (
                              <p className="text-xs text-black line-through dark:text-zinc-500">
                                ¥{Number(item.original_price).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9">
                        <div className="flex items-center rounded-lg border border-zinc-200 w-fit">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item, -1)}
                            disabled={item.quantity <= 1 || updatingId === item.id}
                            className="p-1 px-2 text-zinc-500 hover:text-zinc-900 disabled:opacity-30"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">
                            {updatingId === item.id ? (
                              <Loader2 size={12} className="animate-spin mx-auto text-zinc-400" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item, 1)}
                            disabled={updatingId === item.id}
                            className="p-1 px-2 text-zinc-500 hover:text-zinc-900 disabled:opacity-30"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="absolute top-0 right-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="-m-2 inline-flex p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                          >
                            <span className="sr-only">Remove</span>
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 flex space-x-2 text-sm text-zinc-700">
                      <span className="text-zinc-500">小计:</span>
                      <span className="font-semibold">¥{Number(item.subtotal).toFixed(2)}</span>
                    </p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        {/* Summary */}
        <section className="mt-16 rounded-2xl bg-zinc-50 p-6 sm:p-8 lg:col-span-4 lg:mt-0 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-zinc-900">订单概览</h2>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-zinc-600">商品总数</dt>
              <dd className="text-sm font-medium text-zinc-900">{cart.total_quantity} 件</dd>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
              <dt className="flex items-center text-sm text-zinc-600">
                <Ticket className="mr-2 h-4 w-4 text-zinc-400" />
                <span>优惠扣减</span>
              </dt>
              <dd className="text-sm font-medium text-teal-600">
                - ¥
                {cart.items
                  .reduce((acc, item) => {
                    if (item.original_price && item.active_promotion) {
                      return acc + (item.original_price - item.unit_price) * item.quantity
                    }
                    return acc
                  }, 0)
                  .toFixed(2)}
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
              <dt className="text-base font-bold text-zinc-900">应付总额</dt>
              <dd className="text-xl font-black text-zinc-900">
                ¥{Number(cart.total_amount).toFixed(2)}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            <button
              onClick={() => navigate('/member/checkout')}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] active:shadow-none"
            >
              结算订单
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span>支持 7 天无理由退换货（除特定商品外）</span>
          </div>
        </section>
      </div>
    </div>
  )
}
