import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Plus,
  Loader2,
  Check,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { addressService } from '@/features/address/service'
import type { AddressOut } from '@/features/address/types'
import { cartService } from '@/features/cart/service'
import type { CartOut } from '@/features/cart/types'
import { orderService } from '@/features/order/service'
import { getFileUrl } from '@/shared/utils/file'

import { PaymentModal } from '@/features/order/components/PaymentModal'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<AddressOut[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [cart, setCart] = useState<CartOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [newlyCreatedOrder, setNewlyCreatedOrder] = useState<{ id: string; amount: number } | null>(
    null,
  )

  const fetchData = useCallback(async () => {
    try {
      const [addrList, cartData] = await Promise.all([
        addressService.getMyAddresses(),
        cartService.getMyCart(),
      ])

      setAddresses(addrList)
      setCart(cartData)

      // Auto-select default address
      const defaultAddr = addrList.find((a: AddressOut) => a.is_default)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
      } else if (addrList.length > 0) {
        setSelectedAddressId(addrList[0].id)
      }

      if (!cartData || cartData.items.length === 0) {
        toast.error('购物车是空的')
        navigate('/member/cart')
      }
    } catch (error) {
      console.error('Failed to fetch checkout data', error)
      toast.error('加载结算数据失败')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('请选择收货地址')
      return
    }

    setSubmitting(true)
    try {
      const order = await orderService.createOrder({
        address_id: selectedAddressId,
      })
      // toast.success('订单已提交', {
      //     description: `订单号: ${order.order_no}`
      // })

      // Record order info and show payment modal
      setNewlyCreatedOrder({
        id: order.id,
        amount: Number(order.total_amount),
      })
      setIsPaymentModalOpen(true)
    } catch (error) {
      console.error('Failed to place order', error)
      toast.error(error instanceof Error ? error.message : '下单失败')
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
      <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">确认订单</h1>

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
                    className={`relative cursor-pointer rounded-xl border p-4 transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
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
              {cart?.items.map((item) => (
                <li key={item.id} className="flex py-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50">
                    {item.product_image ? (
                      <img
                        src={getFileUrl(item.product_image)}
                        alt={item.product_name}
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
                      <p className="text-zinc-900">¥{Number(item.unit_price).toFixed(2)}</p>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-zinc-500">
                      <p>数量: {item.quantity}</p>
                      <p className="font-semibold text-zinc-700">
                        小计: ¥{Number(item.subtotal).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Summary */}
        <div className="mt-8 lg:col-span-4 lg:mt-0">
          <div className="rounded-2xl bg-zinc-900 p-6 text-white shadow-xl shadow-zinc-200 sticky top-24">
            <h2 className="text-lg font-bold">费用总计</h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-zinc-400">
                <dt className="text-sm">商品小计</dt>
                <dd className="text-sm font-medium">
                  ¥{Number(cart?.total_amount || 0).toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <dt className="text-sm">运费</dt>
                <dd className="text-sm font-medium">¥0.00</dd>
              </div>
              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <dt className="text-base font-bold">应付总额</dt>
                <dd className="text-2xl font-black">
                  ¥{Number(cart?.total_amount || 0).toFixed(2)}
                </dd>
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
            // Success toast is already in Modal
            navigate('/member/orders')
          }}
          orderId={newlyCreatedOrder.id}
          amount={newlyCreatedOrder.amount}
        />
      )}
    </div>
  )
}
