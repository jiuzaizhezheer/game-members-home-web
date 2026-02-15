import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Package, PackageX, Truck, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

import { merchantService } from '@/features/merchant/service'
import type { OrderOut } from '@/features/order/types'
import type { OrderListOut } from '@/features/order/types'
import { getFileUrl } from '@/shared/utils/file'
import { useConfirm } from '@/components/ui/ConfirmDialog'

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    paid: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    shipped: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    cancelled: 'bg-zinc-50 text-zinc-700 ring-zinc-600/20',
  }

  const labels = {
    pending: '待支付',
    paid: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  }

  const icons = {
    pending: Clock,
    paid: Package,
    shipped: Truck,
    completed: CheckCircle2,
    cancelled: PackageX,
  }

  const Icon = icons[status as keyof typeof icons] || AlertCircle

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status as keyof typeof styles] || styles.pending}`}
    >
      <Icon size={12} />
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}

export default function MerchantOrderList() {
  const confirm = useConfirm()
  const [orders, setOrders] = useState<OrderOut[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  type OrderStatusTab = 'all' | 'pending' | 'paid' | 'shipped' | 'completed'
  const [activeTab, setActiveTab] = useState<OrderStatusTab>('paid')

  const tabs: { id: OrderStatusTab; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'pending', label: '待支付' },
    { id: 'paid', label: '待发货' },
    { id: 'shipped', label: '已发货' },
    { id: 'completed', label: '已完成' },
  ]

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const statusFilter = activeTab === 'all' ? undefined : activeTab
      const res: OrderListOut = await merchantService.getOrders(page, 100, statusFilter)
      setOrders(res.items || [])
    } catch (error) {
      console.error('Failed to fetch orders', error)
      toast.error('加载订单失败')
    } finally {
      setLoading(false)
    }
  }, [activeTab, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleShip = async (e: React.MouseEvent, order: OrderOut) => {
    e.preventDefault()
    if (
      await confirm({
        title: '确认发货',
        description: `确认要将订单 ${order.order_no} 标记为已发货吗？`,
        confirmText: '确认发货',
        cancelText: '取消',
        variant: 'default',
      })
    ) {
      try {
        await merchantService.shipOrder(order.id)
        toast.success('发货成功')
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'shipped' } : o)))
      } catch (error) {
        console.error('Ship order failed', error)
        toast.error('发货失败')
      }
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
                <StatusBadge status={order.status} />
              </div>
              {order.address && (
                <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-2 text-xs text-zinc-500">
                  地址: {order.address.province}
                  {order.address.city}
                  {order.address.district || ''}
                  {order.address.detail}
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
                        onClick={(e) => handleShip(e, order)}
                        className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                      >
                        立即发货
                      </button>
                    )}
                    {/* View Details Link if needed */}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
