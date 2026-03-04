import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { orderService } from '@/features/order/service'
import type { OrderOut } from '@/features/order/types'
import { getFileUrl } from '@/shared/utils/file'
import { useConfirm } from '@/components/ui/confirmContext'

import { PaymentModal } from '@/features/order/components/PaymentModal'
import { ReviewModal } from '@/features/review/components/ReviewModal'

const STATUS_MAP = {
  pending: { label: '待付款', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  paid: { label: '待发货', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Package },
  shipped: { label: '已发货', color: 'text-blue-600', bg: 'bg-blue-50', icon: Truck },
  completed: { label: '已完成', color: 'text-teal-600', bg: 'bg-teal-50', icon: CheckCircle2 },
  cancelled: { label: '已取消', color: 'text-zinc-400', bg: 'bg-zinc-100', icon: XCircle },
  refunding: { label: '退款中', color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertCircle },
  refunded: { label: '已退款', color: 'text-zinc-500', bg: 'bg-zinc-100', icon: XCircle },
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<OrderOut[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<{ id: string; amount: number } | null>(null)

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewItem, setReviewItem] = useState<{
    orderId: string
    productId: string
    productName: string
    productImage?: string | null
  } | null>(null)

  const confirm = useConfirm()

  const handleOpenReviewModal = (
    e: React.MouseEvent,
    orderId: string,
    productId: string,
    productName: string,
    productImage?: string | null,
  ) => {
    e.preventDefault()
    setReviewItem({ orderId, productId, productName, productImage })
    setIsReviewModalOpen(true)
  }

  const handleCancel = async (e: React.MouseEvent, order: OrderOut) => {
    e.preventDefault()
    if (
      await confirm({
        title: '取消订单',
        description: `确定取消订单 ${order.order_no} 吗？取消后将退回库存。`,
        confirmText: '确认取消',
        cancelText: '再想想',
        variant: 'danger',
      })
    ) {
      try {
        await orderService.cancelOrder(order.id)
        toast.success('订单已取消')
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: 'cancelled' } : o)),
        )
      } catch (error) {
        console.error('Failed to cancel order', error)
        toast.error('取消订单失败')
      }
    }
  }

  const handlePay = (e: React.MouseEvent, order: OrderOut) => {
    e.preventDefault()
    setSelectedOrder({ id: order.id, amount: Number(order.total_amount) })
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    if (selectedOrder) {
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: 'paid' } : o)),
      )
    }
  }

  const handleReceipt = async (e: React.MouseEvent, order: OrderOut) => {
    e.preventDefault()
    if (
      await confirm({
        title: '确认收货',
        description: '请确认您已收到商品，确认后订单将标记为完成。',
        confirmText: '确认收货',
        cancelText: '取消',
      })
    ) {
      try {
        await orderService.receiptOrder(order.id)
        toast.success('确认收货成功')
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: 'completed' } : o)),
        )
      } catch (error) {
        console.error(error)
        toast.error('确认收货失败')
      }
    }
  }

  const fetchOrders = useCallback(async () => {
    try {
      const { items, total: totalCount } = await orderService.getMyOrders()
      setOrders(items)
      setTotal(totalCount)
    } catch (error) {
      console.error('Failed to fetch orders', error)
      toast.error('加载订单列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6 rounded-full bg-zinc-50 p-6">
            <Package className="h-12 w-12 text-zinc-300" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">暂无订单</h2>
          <p className="mt-2 text-zinc-500">快去商城看看有哪些喜欢的商品吧！</p>
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">我的订单 ({total})</h1>
      </div>

      <div className="mt-8 space-y-6">
        {orders.map((order) => {
          const status = STATUS_MAP[order.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending
          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm ring-1 ring-zinc-200 overflow-hidden hover:ring-indigo-200 transition-all"
            >
              <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-500">
                  <span className="font-medium text-zinc-900">订单号: {order.order_no}</span>
                  <span className="hidden sm:inline">|</span>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {order.refund_status === 'rejected' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100/50 text-amber-700">
                      <AlertCircle size={14} />
                      售后驳回
                    </div>
                  )}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}
                  >
                    <status.icon size={14} />
                    {status.label}
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                          {item.product_image ? (
                            <img
                              src={getFileUrl(item.product_image)}
                              alt={item.product_name}
                              loading="lazy"
                              className="h-full w-full object-cover object-center"
                            />
                          ) : (
                            <ShoppingBag className="text-zinc-300" size={24} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate">
                            {item.product_name || '商品'}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            ¥{Number(item.unit_price).toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          {order.status === 'completed' && !item.is_reviewed && (
                            <button
                              onClick={(e) =>
                                handleOpenReviewModal(
                                  e,
                                  order.id,
                                  item.product_id,
                                  item.product_name,
                                  item.product_image,
                                )
                              }
                              className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50 transition-colors"
                            >
                              去评价
                            </button>
                          )}
                          {order.status === 'completed' && item.is_reviewed && (
                            <div className="inline-flex items-center gap-1 rounded-full bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-inset ring-zinc-200">
                              <CheckCircle2 className="w-3 h-3" />
                              已评价
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {(order.status === 'shipped' || order.status === 'completed') &&
                      order.courier_name && (
                        <div className="mt-4 flex items-center gap-3 rounded-xl bg-indigo-50/50 px-4 py-2 text-xs text-indigo-700 ring-1 ring-inset ring-indigo-500/10">
                          <Truck size={14} className="shrink-0" />
                          <span className="font-semibold">{order.courier_name}</span>
                          <span className="h-1 w-1 rounded-full bg-indigo-300" />
                          <span className="font-mono">{order.tracking_no}</span>
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                    <p className="text-xs text-zinc-500">应付金额</p>
                    <p className="text-xl font-black text-zinc-900">
                      ¥{Number(order.total_amount).toFixed(2)}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={(e) => handlePay(e, order)}
                            className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                          >
                            去支付
                          </button>
                          <button
                            onClick={(e) => handleCancel(e, order)}
                            className="text-sm font-medium text-zinc-400 hover:text-rose-600 transition-colors"
                          >
                            取消订单
                          </button>
                        </>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={(e) => handleReceipt(e, order)}
                          className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          确认收货
                        </button>
                      )}
                      <Link
                        to={`/member/order/${order.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        查看详情
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {selectedOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
          orderId={selectedOrder.id}
          amount={selectedOrder.amount}
        />
      )}

      {reviewItem && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false)
            setReviewItem(null)
          }}
          onSuccess={fetchOrders}
          orderId={reviewItem.orderId}
          productId={reviewItem.productId}
          productName={reviewItem.productName}
          productImage={reviewItem.productImage}
        />
      )}
    </div>
  )
}
