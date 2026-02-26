import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface ApplyRefundModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string, amount: number) => Promise<void>
  maxAmount: number
}

export function ApplyRefundModal({ isOpen, onClose, onConfirm, maxAmount }: ApplyRefundModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return

    setIsSubmitting(true)
    try {
      await onConfirm(reason, maxAmount)
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
          <h2 className="text-lg font-semibold text-zinc-900">申请售后 / 退款</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-indigo-500 shrink-0" />
              <div className="text-sm text-indigo-900">
                <p className="font-medium mb-1">退款说明</p>
                <p className="text-indigo-700/80">
                  目前仅支持全额退款。提交申请后需等待商家处理，处理通过后款项将原路退回。
                </p>
                <p className="mt-2 text-indigo-900 font-semibold">
                  退款金额: ¥{maxAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="mb-2 block text-sm font-medium text-zinc-700">
                退款原因 <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="reason"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请详细描述您遇到的问题..."
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                rows={4}
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
              disabled={isSubmitting || !reason.trim()}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white outline-none shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:scale-100 disabled:opacity-50"
            >
              {isSubmitting ? '提交中...' : '提交申请'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
