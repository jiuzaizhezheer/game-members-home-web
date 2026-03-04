import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import type { OrderOut, OrderRefundOut } from '@/features/order/types'
import { orderApi } from '@/features/order/api'

interface AuditRefundModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (status: 'approved' | 'rejected', merchant_reply: string) => Promise<void>
  order: OrderOut | null
}

export function AuditRefundModal({ isOpen, onClose, onConfirm, order }: AuditRefundModalProps) {
  const [status, setStatus] = useState<'approved' | 'rejected'>('approved')
  const [reply, setReply] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refundDetail, setRefundDetail] = useState<OrderRefundOut | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    if (isOpen && order) {
      setLoadingDetail(true)
      orderApi
        .getRefundDetail(order.id)
        .then((res) => setRefundDetail(res))
        .catch(console.error)
        .finally(() => setLoadingDetail(false))
    }
    if (!isOpen) {
      // Reset form
      setStatus('approved')
      setReply('')
      setRefundDetail(null)
    }
  }, [isOpen, order])

  if (!isOpen || !order) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onConfirm(status, reply)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">审核退款纠纷</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-700">退款信息</span>
              </div>
              {loadingDetail ? (
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
              ) : refundDetail ? (
                <div className="space-y-1 text-sm text-zinc-600">
                  <p>
                    <span className="text-zinc-400">退款金额:</span> ¥
                    {Number(refundDetail.amount).toFixed(2)}
                  </p>
                  <p>
                    <span className="text-zinc-400">退款原因:</span> {refundDetail.reason}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-zinc-400">无法获取退款详情</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                审核结果 <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm transition-all hover:bg-zinc-50 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700">
                  <input
                    type="radio"
                    name="status"
                    value="approved"
                    checked={status === 'approved'}
                    onChange={() => setStatus('approved')}
                    className="sr-only"
                  />
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${status === 'approved' ? 'border-indigo-500' : 'border-zinc-300'}`}
                  >
                    {status === 'approved' && (
                      <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  同意退款
                </label>
                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm transition-all hover:bg-zinc-50 has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50 has-[:checked]:text-rose-700">
                  <input
                    type="radio"
                    name="status"
                    value="rejected"
                    checked={status === 'rejected'}
                    onChange={() => setStatus('rejected')}
                    className="sr-only"
                  />
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${status === 'rejected' ? 'border-rose-500' : 'border-zinc-300'}`}
                  >
                    {status === 'rejected' && <div className="h-2 w-2 rounded-full bg-rose-500" />}
                  </div>
                  拒绝退款
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="reply" className="mb-2 block text-sm font-medium text-zinc-700">
                处理备注 <span className="text-zinc-400 font-normal">(可选)</span>
              </label>
              <textarea
                id="reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="填写拒绝原因或同意备注..."
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-600 outline-none transition-all hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98] disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingDetail}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white outline-none shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:scale-100 disabled:opacity-50"
            >
              {isSubmitting ? '提交中...' : '提交审批'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
