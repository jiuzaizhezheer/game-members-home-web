import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, PartyPopper } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { adminApi } from '@/features/admin/api'
import { CouponCreateInSchema, type CouponCreateIn } from '@/features/marketing/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AdminCouponCreateModal({ isOpen, onClose, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CouponCreateIn>({
    resolver: zodResolver(CouponCreateInSchema),
    defaultValues: {
      discount_type: 'fixed',
      discount_value: 0,
      min_spend: 0,
      total_quantity: 0,
      start_at: new Date().toISOString().slice(0, 16),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    },
  })

  const discountType = watch('discount_type')

  const onSubmit = async (data: CouponCreateIn) => {
    try {
      // 转换日期格式为 ISOString 以符合后端要求
      const payload = {
        ...data,
        start_at: new Date(data.start_at).toISOString(),
        end_at: new Date(data.end_at).toISOString(),
      }
      await adminApi.createCoupon(payload)
      toast.success('官方优惠券已发布！', {
        icon: <PartyPopper className="text-rose-500" />,
      })
      reset()
      onSuccess()
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : '发布失败'
      toast.error(message)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-8 py-6">
              <div>
                <h2 className="text-xl font-black text-zinc-900">创建官方优惠券</h2>
                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-1">
                  New Platform Voucher
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-zinc-50 p-2 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="max-h-[70vh] overflow-y-auto p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-zinc-700">优惠券名称</label>
                  <input
                    {...register('title')}
                    type="text"
                    placeholder="例如：618大促全场满减券"
                    className="w-full rounded-2xl border-zinc-200 px-4 py-3 text-sm outline-none ring-rose-500/10 transition-all focus:border-rose-500 focus:ring-4"
                  />
                  {errors.title && (
                    <p className="mt-1.5 text-xs font-medium text-rose-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-zinc-700">使用说明</label>
                  <textarea
                    {...register('description')}
                    rows={2}
                    placeholder="描述一下优惠券的使用范围或限制..."
                    className="w-full resize-none rounded-2xl border-zinc-200 px-4 py-3 text-sm outline-none ring-rose-500/10 transition-all focus:border-rose-500 focus:ring-4"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">折扣类型</label>
                  <select
                    {...register('discount_type')}
                    className="w-full rounded-2xl border-zinc-200 px-4 py-3 text-sm outline-none ring-rose-500/10 transition-all focus:border-rose-500 focus:ring-4"
                  >
                    <option value="fixed">固定金额 (减免现金)</option>
                    <option value="percent">百分比折扣 (打折)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">
                    {discountType === 'fixed' ? '减免金额 (¥)' : '折扣比例 (%)'}
                  </label>
                  <input
                    {...register('discount_value', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded-2xl border-zinc-200 px-4 py-3 text-sm outline-none ring-rose-500/10 transition-all focus:border-rose-500 focus:ring-4"
                  />
                  {errors.discount_value && (
                    <p className="mt-1.5 text-xs font-medium text-rose-500">
                      {errors.discount_value.message}
                    </p>
                  )}
                </div>

                {/* Min Spend */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">
                    最低消费门槛 (¥)
                  </label>
                  <input
                    {...register('min_spend', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0 表示无门槛"
                    className="w-full rounded-2xl border-zinc-200 px-4 py-3 text-sm outline-none ring-rose-500/10 transition-all focus:border-rose-500 focus:ring-4"
                  />
                </div>

                {/* Total Quantity */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">
                    发行总量 (张)
                  </label>
                  <input
                    {...register('total_quantity', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="0 表示不限量"
                    className="w-full rounded-2xl border-zinc-200 px-4 py-3 text-sm outline-none ring-rose-500/10 transition-all focus:border-rose-500 focus:ring-4"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">开始时间</label>
                  <input
                    {...register('start_at')}
                    type="datetime-local"
                    className="w-full rounded-2xl border-zinc-200 px-4 py-3 text-sm outline-none ring-rose-500/10 transition-all focus:border-rose-500 focus:ring-4"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">结束时间</label>
                  <input
                    {...register('end_at')}
                    type="datetime-local"
                    className="w-full rounded-2xl border-zinc-200 px-4 py-3 text-sm outline-none ring-rose-500/10 transition-all focus:border-rose-500 focus:ring-4"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-10 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-zinc-200 py-4 text-sm font-bold text-zinc-500 transition-all hover:bg-zinc-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-full bg-rose-600 py-4 text-sm font-bold text-white shadow-xl shadow-rose-200 transition-all hover:bg-rose-700 disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      正在发布...
                    </>
                  ) : (
                    '发布官方优惠券'
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
