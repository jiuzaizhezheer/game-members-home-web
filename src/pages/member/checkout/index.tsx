import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Plus,
  Loader2,
  Check,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Tag,
  ChevronRight,
  Ticket,
} from 'lucide-react'
import { addressService } from '@/features/address/service'
import type { AddressOut } from '@/features/address/types'
import { cartService } from '@/features/cart/service'
import type { CartOut } from '@/features/cart/types'
import { orderService } from '@/features/order/service'
import { couponApi } from '@/features/marketing/api'
import type { UserCouponOut } from '@/features/marketing/types'
import { userApi } from '@/features/user/api'
import { getFileUrl } from '@/shared/utils/file'
import { cn } from '@/shared/utils/cn'

import { PaymentModal } from '@/features/order/components/PaymentModal'

/** 立即购买传入的商品信息 */
interface BuyNowItem {
  product_id: string
  product_name: string
  product_image: string | null
  unit_price: number | string
  quantity: number
}

/** 统一的结算商品展示项 */
interface CheckoutDisplayItem {
  id: string
  product_name: string
  product_image: string | null
  unit_price: number
  quantity: number
  subtotal: number
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // 判断是否为「立即购买」模式
  const buyNowItem = (location.state as { buyNowItem?: BuyNowItem } | null)?.buyNowItem
  const isBuyNowMode = !!buyNowItem

  const [addresses, setAddresses] = useState<AddressOut[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [cart, setCart] = useState<CartOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [newlyCreatedOrder, setNewlyCreatedOrder] = useState<{ id: string; amount: number } | null>(
    null,
  )
  const [availableCoupons, setAvailableCoupons] = useState<UserCouponOut[]>([])
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null)
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [userPoints, setUserPoints] = useState(0)
  const [usePoints, setUsePoints] = useState(false)
  const [pointsToUse, setPointsToUse] = useState<number>(0)

  const fetchData = useCallback(async () => {
    try {
      let addrList: AddressOut[] = []
      if (isBuyNowMode) {
        addrList = await addressService.getMyAddresses()
        setAddresses(addrList)
      } else {
        const [addrListResult, cartData] = await Promise.all([
          addressService.getMyAddresses(),
          cartService.getMyCart(),
        ])
        addrList = addrListResult
        setAddresses(addrListResult)
        setCart(cartData)

        if (!cartData || cartData.items.length === 0) {
          navigate('/member/cart')
          return
        }
      }

      // 获取可用优惠券和积分
      const [couponRes, profile] = await Promise.all([
        couponApi.getMyCoupons({ status: 'unused' }),
        userApi.getMe(),
      ])
      setAvailableCoupons(couponRes)
      setUserPoints(profile.points || 0)

      const defaultAddr = addrList.find((a: AddressOut) => a.is_default)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
      } else if (addrList.length > 0) {
        setSelectedAddressId(addrList[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch checkout data', error)
    } finally {
      setLoading(false)
    }
  }, [navigate, isBuyNowMode])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 组装展示用的商品列表
  const displayItems: CheckoutDisplayItem[] = isBuyNowMode
    ? [
        {
          id: buyNowItem!.product_id,
          product_name: buyNowItem!.product_name,
          product_image: buyNowItem!.product_image,
          unit_price: Number(buyNowItem!.unit_price),
          quantity: buyNowItem!.quantity,
          subtotal: Number(buyNowItem!.unit_price) * buyNowItem!.quantity,
        },
      ]
    : (cart?.items ?? []).map((item) => ({
        id: item.id,
        product_name: item.product_name,
        product_image: item.product_image,
        unit_price: Number(item.unit_price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
      }))

  // 计算最大可使用积分
  const POINTS_TO_CASH_RATIO = 10

  const totalAmount = isBuyNowMode
    ? Number(buyNowItem!.unit_price) * buyNowItem!.quantity
    : Number(cart?.total_amount || 0)

  // 计算优惠金额
  const selectedUserCoupon = availableCoupons.find((c) => c.id === selectedCouponId)
  // 计算优惠金额
  let discountAmount = 0
  if (selectedUserCoupon?.coupon) {
    const c = selectedUserCoupon.coupon
    if (c.discount_type === 'percent') {
      discountAmount = totalAmount * (Number(c.discount_value) / 100)
    } else {
      discountAmount = Number(c.discount_value)
    }
    discountAmount = Math.min(discountAmount, totalAmount)
  }

  const finalAmountBeforePoints = Math.max(0, totalAmount - discountAmount)

  // 计算最大可抵扣积分
  const maxDeductionTotal = finalAmountBeforePoints * 0.5
  const maxPointsByAmount = maxDeductionTotal * POINTS_TO_CASH_RATIO
  // 必须是 10 的整数倍，且不超过用户积分和金额限制
  const maxAvailablePoints = Math.floor(Math.min(userPoints, maxPointsByAmount) / 10) * 10

  // 计算积分抵扣
  let pointDeductionAmount = 0
  if (usePoints && finalAmountBeforePoints >= 10) {
    const actualPoints =
      pointsToUse > 0 ? Math.min(pointsToUse, maxAvailablePoints) : maxAvailablePoints
    pointDeductionAmount = Math.floor(actualPoints / 10) // 确保金额也是整数元
  }

  const finalAmount = Math.max(0, finalAmountBeforePoints - pointDeductionAmount)

  // 当开启开关时，默认填入最大可用积分 (10的倍数)
  useEffect(() => {
    if (usePoints && pointsToUse === 0) {
      setPointsToUse(maxAvailablePoints)
    } else if (!usePoints) {
      setPointsToUse(0)
    }
  }, [usePoints, pointsToUse, maxAvailablePoints])

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      return
    }

    setSubmitting(true)
    try {
      let order

      if (isBuyNowMode) {
        // 立即购买模式：调用 buy-now 接口
        order = await orderService.buyNow({
          product_id: buyNowItem!.product_id,
          quantity: buyNowItem!.quantity,
          address_id: selectedAddressId,
          user_coupon_id: selectedCouponId,
          use_points: usePoints,
          points_to_use: usePoints ? pointsToUse : undefined,
        })
      } else {
        // 购物车结算模式
        order = await orderService.createOrder({
          address_id: selectedAddressId,
          user_coupon_id: selectedCouponId,
          use_points: usePoints,
          points_to_use: usePoints ? pointsToUse : undefined,
        })
      }

      setNewlyCreatedOrder({
        id: order.id,
        amount: Number(order.total_amount),
      })
      setIsPaymentModalOpen(true)
    } catch (error) {
      console.error('Failed to place order', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
        {isBuyNowMode ? '立即购买' : '确认订单'}
      </h1>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
        <div className="lg:col-span-8 space-y-8">
          {/* Address Selection */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <MapPin className="text-indigo-600" size={20} />
                收货地址
              </h2>
              <button
                onClick={() => navigate('/member/profile/addresses')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus size={16} />
                管理地址
              </button>
            </div>

            {addresses.length === 0 ? (
              <div
                onClick={() => navigate('/member/profile/addresses')}
                className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors"
              >
                <Plus className="text-zinc-400 mb-2" size={32} />
                <span className="text-sm text-zinc-500 font-medium">新增收货地址</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={cn(
                      'relative cursor-pointer rounded-xl border p-4 transition-all',
                      selectedAddressId === addr.id
                        ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
                        : 'border-zinc-200 hover:border-zinc-300',
                    )}
                  >
                    {selectedAddressId === addr.id && (
                      <div className="absolute top-3 right-3 h-5 w-5 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                        <Check size={12} />
                      </div>
                    )}
                    <p className="font-bold text-zinc-900">{addr.receiver_name}</p>
                    <p className="mt-1 text-sm text-zinc-500">{addr.phone}</p>
                    <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                      {addr.province} {addr.city} {addr.district}
                      <br />
                      {addr.detail}
                    </p>
                    {addr.is_default && (
                      <span className="mt-3 inline-block px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider">
                        默认
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Items Review */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <ShoppingBag className="text-indigo-600" size={20} />
              商品清单
            </h2>
            <ul className="divide-y divide-zinc-100">
              {displayItems.map((item) => (
                <li key={item.id} className="flex py-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50">
                    {item.product_image ? (
                      <img
                        src={getFileUrl(item.product_image)}
                        alt={item.product_name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-300">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-1 flex-col justify-center">
                    <div className="flex justify-between text-sm font-medium">
                      <h3 className="text-zinc-900">{item.product_name}</h3>
                      <p className="text-zinc-900">¥{item.unit_price.toFixed(2)}</p>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-zinc-500">
                      <p>数量: {item.quantity}</p>
                      <p className="font-semibold text-zinc-700">
                        小计: ¥{item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Coupon Selection */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Tag className="text-indigo-600" size={20} />
                优惠券
              </h2>
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-indigo-600 py-2 px-4 rounded-xl hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100"
              >
                {selectedCouponId ? (
                  <span className="text-indigo-600 font-bold">
                    {selectedUserCoupon?.coupon?.title} (-¥{discountAmount.toFixed(2)})
                  </span>
                ) : (
                  <span>选择优惠券</span>
                )}
                <ChevronRight size={16} />
              </button>
            </div>
          </section>

          {/* Points Redemption */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="text-teal-600" size={20} />
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-zinc-900">积分抵扣</h2>
                  <p className="text-xs text-zinc-500">可用积分: {userPoints} (10积分 = ¥1)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {usePoints && pointDeductionAmount > 0 && (
                  <span className="text-sm font-bold text-teal-600 animate-in fade-in slide-in-from-right-2">
                    -¥{pointDeductionAmount.toFixed(2)}
                  </span>
                )}
                <button
                  onClick={() => setUsePoints(!usePoints)}
                  disabled={userPoints < 10 || finalAmountBeforePoints < 10}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed',
                    usePoints ? 'bg-teal-500' : 'bg-zinc-200',
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      usePoints ? 'translate-x-5' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>
            </div>
            {usePoints && (
              <div className="mt-4 pt-4 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="points-input" className="text-sm text-zinc-600 font-medium">
                    使用积分数量
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="points-input"
                      type="number"
                      step="10"
                      min="0"
                      max={maxAvailablePoints}
                      value={pointsToUse || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        const steppedVal = Math.floor(val / 10) * 10
                        setPointsToUse(Math.min(steppedVal, maxAvailablePoints))
                      }}
                      className="w-24 rounded-lg border-zinc-200 bg-zinc-50 px-2 py-1 text-right text-sm font-bold text-zinc-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                    <span className="text-xs text-zinc-400">/ {maxAvailablePoints}</span>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-zinc-400">
                  本次最多可抵扣 ¥{pointDeductionAmount.toFixed(2)}
                </p>
              </div>
            )}
            {finalAmountBeforePoints < 10 && userPoints >= 10 && (
              <p className="mt-2 text-[10px] text-zinc-400">订单满 ¥10 开启积分抵扣</p>
            )}
          </section>
        </div>

        {/* Summary */}
        <div className="mt-8 lg:col-span-4 lg:mt-0">
          <div className="rounded-2xl bg-zinc-900 p-6 text-white shadow-xl shadow-zinc-200 sticky top-24">
            <h2 className="text-lg font-bold">费用总计</h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-zinc-400">
                <dt className="text-sm">商品小计</dt>
                <dd className="text-sm font-medium">¥{totalAmount.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <dt className="text-sm">运费</dt>
                <dd className="text-sm font-medium">¥0.00</dd>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-indigo-400">
                  <dt className="text-sm">优惠券抵扣</dt>
                  <dd className="text-sm font-medium">-¥{discountAmount.toFixed(2)}</dd>
                </div>
              )}
              {pointDeductionAmount > 0 && (
                <div className="flex items-center justify-between text-teal-400">
                  <dt className="text-sm">积分抵扣</dt>
                  <dd className="text-sm font-medium">-¥{pointDeductionAmount.toFixed(2)}</dd>
                </div>
              )}
              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <dt className="text-base font-bold">应付总额</dt>
                <dd className="text-2xl font-black">¥{finalAmount.toFixed(2)}</dd>
              </div>
            </dl>

            <div className="mt-8 space-y-4">
              {selectedAddress ? (
                <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                  <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                    <MapPin size={12} />
                    配送至:
                  </p>
                  <p className="text-sm font-medium truncate">
                    {selectedAddress.receiver_name} - {selectedAddress.phone}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 truncate">
                    {selectedAddress.province} {selectedAddress.city} {selectedAddress.detail}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-rose-500/10 p-4 border border-rose-500/20 text-rose-400 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span className="text-xs font-medium">请先选择或新增收件地址</span>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting || !selectedAddressId}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    去支付
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <CreditCard size={14} />
                <span>支持多种支付方式</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {newlyCreatedOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false)
            navigate('/member/orders')
          }}
          onSuccess={() => {
            navigate('/member/orders')
          }}
          orderId={newlyCreatedOrder.id}
          amount={newlyCreatedOrder.amount}
        />
      )}

      {/* Coupon Selection Modal */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden overflow-y-auto max-h-[80vh]"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-lg font-bold text-zinc-900">选择优惠券</h3>
                <button
                  onClick={() => setIsCouponModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 p-2 hover:bg-zinc-50 rounded-full transition-all"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div
                  onClick={() => {
                    setSelectedCouponId(null)
                    setIsCouponModalOpen(false)
                  }}
                  className={cn(
                    'p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between',
                    selectedCouponId === null
                      ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                      : 'border-zinc-100 hover:border-zinc-200',
                  )}
                >
                  <span className="text-sm font-medium text-zinc-900">不使用优惠券</span>
                  {selectedCouponId === null && <Check className="text-indigo-600 w-5 h-5" />}
                </div>

                {availableCoupons.length > 0 ? (
                  availableCoupons.map((userCoupon) => {
                    const c = userCoupon.coupon!
                    const isEligible = totalAmount >= Number(c.min_spend)

                    return (
                      <div
                        key={userCoupon.id}
                        onClick={() => {
                          if (isEligible) {
                            setSelectedCouponId(userCoupon.id)
                            setIsCouponModalOpen(false)
                          }
                        }}
                        className={cn(
                          'relative p-4 rounded-2xl border transition-all flex flex-col gap-3',
                          !isEligible
                            ? 'opacity-50 grayscale cursor-not-allowed bg-zinc-50 border-zinc-100'
                            : selectedCouponId === userCoupon.id
                              ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600 cursor-pointer'
                              : 'border-zinc-100 hover:border-zinc-200 cursor-pointer',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-indigo-600 shadow-sm">
                              <Ticket className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900">{c.title}</p>
                              <p className="text-[10px] text-zinc-500">
                                满 ¥{Number(c.min_spend)} 可用
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-black text-indigo-600">
                              {c.discount_type === 'fixed'
                                ? `¥${Number(c.discount_value)}`
                                : `${Number(c.discount_value)}%`}
                            </p>
                          </div>
                        </div>
                        {!isEligible && (
                          <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                            <AlertCircle size={10} />
                            还差 ¥{(Number(c.min_spend) - totalAmount).toFixed(2)} 满足门槛
                          </p>
                        )}
                        {selectedCouponId === userCoupon.id && (
                          <div className="absolute top-2 right-2 h-5 w-5 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
                    <Ticket className="w-12 h-12 mb-2 opacity-10" />
                    <p className="text-xs">暂无可用的优惠券</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-zinc-50/50 border-t border-zinc-100">
                <button
                  onClick={() => setIsCouponModalOpen(false)}
                  className="w-full py-3 bg-zinc-900 text-white rounded-full text-sm font-bold shadow-lg shadow-zinc-200"
                >
                  确认选择
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
