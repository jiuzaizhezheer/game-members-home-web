import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, X, Loader2 } from 'lucide-react'

import { OrderShipInSchema, type OrderShipIn, type OrderOut } from '@/features/order/types'

interface ShipmentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: OrderShipIn) => Promise<void>
  order: OrderOut | null
}

const COURIER_OPTIONS = ['顺丰快递', '中通快递', '圆通快递', '邮政EMS']

export function ShipmentModal({ isOpen, onClose, onConfirm, order }: ShipmentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderShipIn>({
    resolver: zodResolver(OrderShipInSchema),
    defaultValues: {
      courier_name: '顺丰快递',
    },
  })

  const onSubmit = async (data: OrderShipIn) => {
    try {
      await onConfirm(data)
      reset()
      onClose()
    } catch {
      // Error handled by parent
    }
  }

  return (
    <AnimatePresence>
      {isOpen && order && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">填写发货信息</h3>
                <p className="text-sm text-zinc-500">订单号: {order.order_no}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Courier Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">快递公司</label>
                <select
                  {...register('courier_name')}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                >
                  {COURIER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="其他">其他</option>
                </select>
                {errors.courier_name && (
                  <p className="text-xs text-rose-500">{errors.courier_name.message}</p>
                )}
              </div>

              {/* Tracking Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">运单号</label>
                <input
                  type="text"
                  placeholder="请输入真实的物流单号"
                  {...register('tracking_no')}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
                {errors.tracking_no && (
                  <p className="text-xs text-rose-500">{errors.tracking_no.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-95 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 items-center justify-center flex rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    '确认发货'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
