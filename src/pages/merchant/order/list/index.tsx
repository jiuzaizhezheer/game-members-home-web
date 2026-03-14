import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Package, PackageX, Truck, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

import { merchantService } from '@/features/merchant/service'
import { merchantApi } from '@/features/merchant/api'
import type { OrderOut } from '@/features/order/types'
import type { OrderListOut } from '@/features/order/types'
import { getFileUrl } from '@/shared/utils/file'
import { ShipmentModal } from './ShipmentModal'
import { AuditRefundModal } from './AuditRefundModal'
import type { OrderShipIn } from '@/features/order/types'
import { orderApi } from '@/features/order/api'

// Status Badge Component
const StatusBadge = ({
  status,
  refundStatus,
}: {
  status: string
  refundStatus?: string | null
}) => {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    paid: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    shipped: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    cancelled: 'bg-zinc-50 text-zinc-700 ring-zinc-600/20',
    refunding: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    refunded: 'bg-zinc-50 text-zinc-700 ring-zinc-600/20',
    closed: 'bg-zinc-50 text-zinc-700 ring-zinc-600/20',
  }

  const labels = {
    pending: '待支付',
    paid: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    refunding: '退款中',
    refunded: '已退款',
    closed: '已关闭',
  }

  const icons = {
    pending: Clock,
    paid: Package,
    shipped: Truck,
    completed: CheckCircle2,
    cancelled: PackageX,
    refunding: AlertCircle,
    refunded: PackageX,
    closed: PackageX,
  }

  const Icon = icons[status as keyof typeof icons] || AlertCircle

  return (
    <div className="flex items-center gap-2">
      {refundStatus === 'rejected' && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
          售后驳回
        </span>
      )}
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status as keyof typeof styles] || styles.pending}`}
      >
        <Icon size={12} />
        {labels[status as keyof typeof labels] || status}
      </span>
    </div>
  )
}

export default function MerchantOrderList() {
  const [orders, setOrders] = useState<OrderOut[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  type OrderStatusTab =
    | 'all'
    | 'pending'
    | 'paid'
    | 'shipped'
    | 'completed'
    | 'refunding'
    | 'refunded'
    | 'rejected'
  const [activeTab, setActiveTab] = useState<OrderStatusTab>('paid')

  // Shipment Modal State
  const [isShipModalOpen, setIsShipModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderOut | null>(null)

  const tabs: { id: OrderStatusTab; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'pending', label: '待支付' },
    { id: 'paid', label: '待发货' },
    { id: 'shipped', label: '已发货' },
    { id: 'completed', label: '已完成' },
    { id: 'refunding', label: '售后/退款' },
    { id: 'refunded', label: '已退款' },
    { id: 'rejected', label: '已驳回' },
  ]

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const statusFilter = activeTab === 'all' || activeTab === 'rejected' ? undefined : activeTab
      const refundStatusFilter = activeTab === 'rejected' ? 'rejected' : undefined
      const res: OrderListOut = await merchantService.getOrders(
        page,
        100,
        statusFilter,
        refundStatusFilter,
      )
      setOrders(res.items || [])
    } catch (error) {
      console.error('Failed to fetch orders', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleShipClick = (e: React.MouseEvent, order: OrderOut) => {
    e.preventDefault()
    setSelectedOrder(order)
    setIsShipModalOpen(true)
  }

  const handleShipConfirm = async (data: OrderShipIn) => {
    if (!selectedOrder) return
    try {
      await merchantService.shipOrder(selectedOrder.id, data)
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: 'shipped', ...data } : o)),
      )
    } catch (error) {
      console.error('Ship order failed', error)
      throw error // Let the modal handles isSubmitting
    }
  }

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)

  const handleAuditClick = (e: React.MouseEvent, order: OrderOut) => {
    e.preventDefault()
    setSelectedOrder(order)
    setIsAuditModalOpen(true)
  }

  const handleAuditConfirm = async (status: 'approved' | 'rejected', merchant_reply: string) => {
    if (!selectedOrder) return
    try {
      // API call expects refund_id, but the order structure only has `status === 'refunding'`.
      // We will need to fetch the refund detail to get the refund ID first.
      const detail = await orderApi.getRefundDetail(selectedOrder.id).catch(() => null)
      if (!detail) {
        return
      }
      await merchantApi.auditRefund(detail.id, { status, merchant_reply })
      fetchOrders() // Refresh the list
    } catch (error) {
      console.error('Audit failed', error)
      throw error
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">订单管理</h1>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-2xl bg-zinc-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setPage(1)
              }}
              className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <PackageX size={48} className="mb-4 text-zinc-200" />
          <p>暂无订单数据</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
            >
              <div className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span className="font-mono">{order.order_no}</span>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                  <span className="hidden sm:inline">
                    客户:{' '}
                    {order.address
                      ? `${order.address.receiver_name} ${order.address.phone}`
                      : '未指定'}
                  </span>
                </div>
                <StatusBadge status={order.status} refundStatus={order.refund_status} />
              </div>
              {order.address && (
                <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-2 text-xs text-zinc-500">
                  地址: {order.address.province}
                  {order.address.city}
                  {order.address.district || ''}
                  {order.address.detail}
                </div>
              )}

              {order.status !== 'pending' && order.status !== 'paid' && order.courier_name && (
                <div className="border-b border-zinc-100 bg-indigo-50/30 px-6 py-2 text-xs flex items-center gap-4">
                  <span className="text-indigo-600 font-medium">物流信息:</span>
                  <span className="text-zinc-600">
                    {order.courier_name} | {order.tracking_no}
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                        {item.product_image && (
                          <img
                            src={getFileUrl(item.product_image)}
                            alt={item.product_name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 justify-between">
                        <div>
                          <h3 className="font-medium text-zinc-900 line-clamp-2">
                            {item.product_name}
                          </h3>
                          <p className="mt-1 text-sm text-zinc-500">数量: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-zinc-900">
                            ¥{Number(item.unit_price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                  <div className="text-sm">
                    <span className="text-zinc-500">订单总额: </span>
                    <span className="text-lg font-bold text-zinc-900">
                      ¥{Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {order.status === 'paid' && (
                      <button
                        onClick={(e) => handleShipClick(e, order)}
                        className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                      >
                        立即发货
                      </button>
                    )}
                    {order.status === 'refunding' && (
                      <button
                        onClick={(e) => handleAuditClick(e, order)}
                        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-200 hover:bg-rose-700 transition-all active:scale-[0.98]"
                      >
                        处理售后
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ShipmentModal
        isOpen={isShipModalOpen}
        onClose={() => setIsShipModalOpen(false)}
        onConfirm={handleShipConfirm}
        order={selectedOrder}
      />
      <AuditRefundModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onConfirm={handleAuditConfirm}
        order={selectedOrder}
      />
    </div>
  )
}
