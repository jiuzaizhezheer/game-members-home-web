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
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { orderService } from '@/features/order/service'
import type { OrderOut, OrderRefundOut, OrderLogisticsOut } from '@/features/order/types'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { getFileUrl } from '@/shared/utils/file'
import { useConfirm } from '@/components/ui/confirmContext'

import { PaymentModal } from '@/features/order/components/PaymentModal'
import { ApplyRefundModal } from '@/features/order/components/ApplyRefundModal'
import { ReviewModal } from '@/features/review/components/ReviewModal'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [refundDetail, setRefundDetail] = useState<OrderRefundOut | null>(null)
  const [logistics, setLogistics] = useState<OrderLogisticsOut | null>(null)
  const [logisticsLoading, setLogisticsLoading] = useState(false)

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewItem, setReviewItem] = useState<{
    productId: string
    productName: string
    productImage?: string | null
  } | null>(null)

  const fetchOrderDetail = useCallback(async (orderId: string) => {
    try {
      setLoading(true)
      const data = await orderService.getOrderDetail(orderId)
      setOrder(data)

      // Fetch refund detail if status implies it
      if (
        ['refunding', 'refunded', 'closed'].includes(data.status) ||
        data.refund_status === 'rejected' ||
        data.refund_status === 'pending'
      ) {
        try {
          const refund = await orderService.getRefundDetail(orderId)
          setRefundDetail(refund)
        } catch (e) {
          console.error('Failed to fetch refund details', e)
        }
      }

      // Fetch logistics if shipped or completed
      if (['shipped', 'completed'].includes(data.status)) {
        try {
          setLogisticsLoading(true)
          const logisticsData = await orderService.getOrderLogistics(orderId)
          setLogistics(logisticsData)
        } catch (e) {
          console.error('Failed to fetch logistics', e)
        } finally {
          setLogisticsLoading(false)
        }
      }
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

  const handleRefundConfirm = async (reason: string) => {
    if (!order) return
    try {
      await orderService.applyRefund(order.id, { reason })
      toast.success('售后申请已提交，请等待商家处理')
      fetchOrderDetail(order.id)
    } catch (error) {
      console.error('Failed to apply refund', error)
      toast.error('申请失败')
      throw error
    }
  }

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

  const handleOpenReviewModal = (
    productId: string,
    productName: string,
    productImage?: string | null,
  ) => {
    setReviewItem({ productId, productName, productImage })
    setIsReviewModalOpen(true)
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
    refunding: { label: '退款中', color: 'text-rose-600 bg-rose-50' },
    refunded: { label: '已退款', color: 'text-zinc-400 bg-zinc-100' },
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
          <div className="flex items-center gap-2">
            {order.refund_status === 'rejected' && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                <AlertCircle className="w-4 h-4" />
                售后申请已驳回
              </div>
            )}
            <div
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${currentStatus.color}`}
            >
              {currentStatus.label}
            </div>
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
                    {order.status === 'completed' && !item.is_reviewed && (
                      <button
                        onClick={() =>
                          handleOpenReviewModal(
                            item.product_id,
                            item.product_name,
                            item.product_image,
                          )
                        }
                        className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50 transition-colors"
                      >
                        去评价
                      </button>
                    )}
                    {order.status === 'completed' && item.is_reviewed && (
                      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-inset ring-zinc-200">
                        <CheckCircle2 className="w-3 h-3" />
                        已评价
                      </div>
                    )}
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

          {/* Logistics Timeline */}
          {order.status !== 'cancelled' && order.status !== 'pending' && (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-semibold text-zinc-900">物流轨迹</h2>
                </div>
              </div>
              <div className="p-6">
                {logisticsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
                  </div>
                ) : logistics && logistics.items.length > 0 ? (
                  <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-zinc-100">
                    {logistics.items.map((item, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.id}
                        className="relative flex items-start gap-6"
                      >
                        <div
                          className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-full shadow-md ${
                            idx === 0
                              ? 'bg-indigo-600 text-white shadow-indigo-200 ring-4 ring-indigo-50'
                              : 'bg-white text-zinc-400 border border-zinc-200 shadow-sm'
                          }`}
                        >
                          {idx === 0 ? (
                            <Truck size={18} />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-current" />
                          )}
                        </div>
                        <div className="ml-14 flex-1 pb-2">
                          <p
                            className={`text-sm font-bold ${idx === 0 ? 'text-zinc-900' : 'text-zinc-500'}`}
                          >
                            {item.status_message}
                          </p>
                          {item.location && (
                            <p className="mt-1 text-xs text-zinc-400">
                              <MapPin size={10} className="inline mr-1" />
                              {item.location}
                            </p>
                          )}
                          <p className="mt-1.5 text-[10px] font-mono text-zinc-400">
                            {new Date(item.log_time).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                    <Truck size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">暂无详细物流轨迹</p>
                    <p className="text-[10px]">包裹正在揽收或等待同步中...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Status History */}
          {order.status !== 'cancelled' && order.status !== 'pending' && (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/50 shadow-sm opacity-80 scale-95 origin-top transition-all hover:opacity-100 hover:scale-100">
              <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                  <h2 className="font-semibold text-zinc-500">订单关键节点</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-zinc-100">
                  {/* Refund events at the top */}
                  {order.status === 'refunded' && (
                    <div className="relative flex items-center gap-6">
                      <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-500 text-white shadow-lg shadow-zinc-100">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="ml-14">
                        <p className="text-sm font-semibold text-zinc-900">退款成功</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          售后申请已完成，款项将原路退回
                        </p>
                      </div>
                    </div>
                  )}

                  {order.refund_status === 'rejected' && (
                    <div className="relative flex items-center gap-6">
                      <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-100">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="ml-14">
                        <p className="text-sm font-semibold text-zinc-900">售后申请被驳回</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          商家已拒绝退款申请，您可以联系客服详谈
                        </p>
                        {refundDetail?.merchant_reply && (
                          <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 border border-amber-200/50">
                            商家回复: {refundDetail.merchant_reply}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {order.status === 'refunding' && (
                    <div className="relative flex items-center gap-6">
                      <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-100 animate-pulse">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="ml-14">
                        <p className="text-sm font-semibold text-zinc-900">售后申请处理中</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          请耐心等待商家审核您的售后申请
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Standard Milestones based on timestamps */}
                  {order.completed_at && (
                    <div className="relative flex items-center gap-6">
                      <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-100">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="ml-14">
                        <p className="text-sm font-semibold text-zinc-900">订单已完成</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          感谢您的支持，期待再次为您服务
                        </p>
                        <p className="mt-1 text-[10px] text-zinc-400 font-mono">
                          {new Date(order.completed_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.shipped_at && (
                    <div className="relative flex items-center gap-6">
                      <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-100">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="ml-14">
                        <p className="text-sm font-semibold text-zinc-900">商品已发货</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {order.courier_name}: {order.tracking_no}
                        </p>
                        <p className="mt-1 text-[10px] text-zinc-400 font-mono">
                          {new Date(order.shipped_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.paid_at && (
                    <div className="relative flex items-center gap-6">
                      <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-100">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="ml-14">
                        <p className="text-sm font-semibold text-zinc-900">支付成功</p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          您的订单已支付成功，商家正在处理中
                        </p>
                        <p className="mt-1 text-[10px] text-zinc-400 font-mono">
                          {new Date(order.paid_at).toLocaleString()}
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
                      <p className="mt-0.5 text-xs text-zinc-500">订单号: {order.order_no}</p>
                      <p className="mt-1 text-[10px] text-zinc-400 font-mono">
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
                    ['pending', 'refunding', 'refunded'].includes(order.status)
                      ? order.status === 'pending'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                      : order.status === 'cancelled'
                        ? 'text-zinc-400'
                        : 'text-emerald-600'
                  }`}
                >
                  {order.status === 'pending'
                    ? '待支付'
                    : order.status === 'cancelled'
                      ? '已取消'
                      : order.status === 'refunded'
                        ? '已退款'
                        : order.status === 'refunding'
                          ? '退款中'
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
          {(order.status === 'shipped' ||
            order.status === 'paid' ||
            order.status === 'completed') && (
            <div className="flex flex-col gap-3">
              {order.status === 'shipped' && (
                <button
                  onClick={handleReceipt}
                  className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  确认收货
                </button>
              )}
              <button
                onClick={() => setIsRefundModalOpen(true)}
                className="w-full rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-all active:scale-[0.98]"
              >
                申请退款/售后
              </button>
            </div>
          )}

          {/* Refund Progress Card */}
          {['refunding', 'refunded'].includes(order.status) && refundDetail && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 shadow-sm shadow-rose-100/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 rounded-l-2xl"></div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <h2 className="font-semibold text-rose-900">售后服务</h2>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${refundDetail.status === 'pending' ? 'bg-amber-100 text-amber-700' : refundDetail.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                >
                  {refundDetail.status === 'pending'
                    ? '等待商家处理'
                    : refundDetail.status === 'approved'
                      ? '商家已同意'
                      : '商家已拒绝'}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-zinc-500">退款金额</span>
                  <span className="font-semibold text-zinc-900">
                    ¥{Number(refundDetail.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-zinc-500 shrink-0">退款原因</span>
                  <span className="text-right text-zinc-900">{refundDetail.reason}</span>
                </div>
                {refundDetail.status === 'rejected' && refundDetail.merchant_reply && (
                  <div className="mt-3 bg-red-50/50 border border-red-100 rounded-xl p-3 text-red-800">
                    <span className="font-semibold block mb-1">商家拒绝原因：</span>
                    {refundDetail.merchant_reply}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {order && (
        <>
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onSuccess={handlePaymentSuccess}
            orderId={order.id}
            amount={Number(order.total_amount)}
          />
          <ApplyRefundModal
            isOpen={isRefundModalOpen}
            onClose={() => setIsRefundModalOpen(false)}
            onConfirm={handleRefundConfirm}
            maxAmount={Number(order.total_amount)}
          />
        </>
      )}

      {order && reviewItem && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false)
            setReviewItem(null)
          }}
          onSuccess={() => fetchOrderDetail(order.id)}
          orderId={order.id}
          productId={reviewItem.productId}
          productName={reviewItem.productName}
          productImage={reviewItem.productImage}
        />
      )}
    </motion.div>
  )
}
