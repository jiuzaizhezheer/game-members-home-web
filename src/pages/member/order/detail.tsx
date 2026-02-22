import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  ArrowRight,
  Truck,
  Copy,
  CheckCircle2,
} from 'lucide-react'
import { orderService } from '@/features/order/service'
import type { OrderOut } from '@/features/order/types'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { getFileUrl } from '@/shared/utils/file'
import { useConfirm } from '@/components/ui/confirmContext'

import { PaymentModal } from '@/features/order/components/PaymentModal'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const fetchOrderDetail = useCallback(async (orderId: string) => {
    try {
      setLoading(true)
      const data = await orderService.getOrderDetail(orderId)
      setOrder(data)
    } catch (error) {
      toast.error('获取订单详情失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchOrderDetail(id)
    }
  }, [id, fetchOrderDetail])

  const confirm = useConfirm()

  const handleCopyTrackingNo = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('单号已复制到剪贴板')
  }

  const handleCancel = async () => {
    if (!order) return
    if (
      await confirm({
        title: '取消订单',
        description: '确定取消该订单吗？取消后将退回库存。',
        confirmText: '确认取消',
        cancelText: '再想想',
        variant: 'danger',
      })
    ) {
      try {
        await orderService.cancelOrder(order.id)
        toast.success('订单已取消')
        // 刷新详情
        fetchOrderDetail(order.id)
      } catch (error) {
        console.error('Failed to cancel order', error)
        toast.error('取消订单失败')
      }
    }
  }

  const handlePay = () => {
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    if (order) {
      fetchOrderDetail(order.id)
    }
  }

  const handleReceipt = async () => {
    if (!order) return
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
        fetchOrderDetail(order.id)
      } catch (error) {
        console.error(error)
        toast.error('确认收货失败')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">未找到该订单</p>
        <button
          onClick={() => navigate('/member/orders')}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          返回订单列表
        </button>
      </div>
    )
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: '待付款', color: 'text-amber-600 bg-amber-50' },
    paid: { label: '待发货', color: 'text-blue-600 bg-blue-50' },
    shipped: { label: '已发货', color: 'text-indigo-600 bg-indigo-50' },
    completed: { label: '已完成', color: 'text-emerald-600 bg-emerald-50' },
    cancelled: { label: '已取消', color: 'text-zinc-500 bg-zinc-50' },
  }

  const currentStatus = statusMap[order.status] || {
    label: order.status,
    color: 'text-zinc-600 bg-zinc-50',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/member/orders')}
          className="group mb-4 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          返回订单列表
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">订单详情</h1>
            <p className="mt-1 text-sm text-zinc-500">订单号: {order.order_no}</p>
          </div>
          <div
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${currentStatus.color}`}
          >
            {currentStatus.label}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logistics Section */}
          {order.courier_name && order.tracking_no && (
            <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50/20 shadow-sm border-l-4 border-l-indigo-500 transition-all hover:shadow-md">
              <div className="px-6 py-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg ${order.status === 'completed' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-indigo-500 shadow-indigo-100'}`}
                  >
                    {order.status === 'completed' ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Truck size={20} />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900">
                        {order.status === 'completed' ? '物流派送已完毕' : '物流派送中'}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-600 font-medium">
                        <span>{order.courier_name}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-300" />
                        <span className="font-mono">{order.tracking_no}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyTrackingNo(order.tracking_no!)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50 transition-all active:scale-95 shrink-0 w-fit"
                    >
                      <Copy size={12} />
                      复制单号
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-500" />
                <h2 className="font-semibold text-zinc-900">商品清单</h2>
              </div>
            </div>
            <div className="divide-y divide-zinc-100 px-6">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-4 border-b border-zinc-50 last:border-0"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                    {item.product_image ? (
                      <img
                        src={getFileUrl(item.product_image)}
                        alt={item.product_name}
                        loading="lazy"
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <Package className="text-zinc-300" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/member/product/${item.product_id}`}
                      className="text-base font-medium text-zinc-900 hover:text-indigo-600 transition-colors truncate block"
                    >
                      {item.product_name}
                    </Link>
                    <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
                      <span>数量: {item.quantity}</span>
                      <span>单价: ¥{Number(item.unit_price).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-semibold text-zinc-900">
                      ¥{(Number(item.unit_price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-zinc-50/30 px-6 py-4 border-t border-zinc-100">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">订单总计</span>
                <span className="text-xl font-bold text-zinc-900">
                  ¥{Number(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Logistics Mockup - Order timeline */}
          {order.status !== 'cancelled' && order.status !== 'pending' && (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-semibold text-zinc-900">订单状态流转</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-indigo-300 before:to-zinc-100">
                  {/* Dynamically added status nodes could go here */}
                  {order.status === 'completed' && (
                    <div className="relative flex items-center gap-6">
                      <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-100">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="ml-14">
                        <p className="text-sm font-semibold text-zinc-900">订单已完成</p>
                        <p className="mt-0.5 text-xs text-zinc-500">期待再次为您服务</p>
                      </div>
                    </div>
                  )}
                  {(order.status === 'shipped' || order.status === 'completed') && (
                    <div className="relative flex items-center gap-6">
                      <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-100">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="ml-14">
                        <p className="text-sm font-semibold text-zinc-900">商品已发货</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {order.courier_name}: {order.tracking_no}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="relative flex items-center gap-6">
                    <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-200">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <div className="ml-14">
                      <p className="text-sm font-semibold text-zinc-900">订单创建成功</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              <h2 className="font-semibold text-zinc-900">收货地址</h2>
            </div>
            <p className="text-sm text-zinc-500">地址ID: {order.address_id}</p>
          </div>

          {/* Payment Info */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              <h2 className="font-semibold text-zinc-900">支付信息</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">支付方式</span>
                <span className="text-zinc-900 font-medium">在线支付</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">支付状态</span>
                <span
                  className={`font-medium ${
                    order.status === 'pending'
                      ? 'text-amber-600'
                      : order.status === 'cancelled'
                        ? 'text-zinc-400'
                        : 'text-emerald-600'
                  }`}
                >
                  {order.status === 'pending'
                    ? '待支付'
                    : order.status === 'cancelled'
                      ? '已取消'
                      : '已支付'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {order.status === 'pending' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePay}
                className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                立即支付
              </button>
              <button
                onClick={handleCancel}
                className="w-full rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-all active:scale-[0.98]"
              >
                取消订单
              </button>
            </div>
          )}
          {order.status === 'shipped' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleReceipt}
                className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                确认收货
              </button>
            </div>
          )}
        </div>
      </div>
      {order && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
          orderId={order.id}
          amount={Number(order.total_amount)}
        />
      )}
    </motion.div>
  )
}
