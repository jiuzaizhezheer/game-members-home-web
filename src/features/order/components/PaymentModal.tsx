import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, X, CheckCircle2, CreditCard, Wallet, Smartphone, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { orderService } from '@/features/order/service'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  orderId: string
  amount: number
}

const PAYMENT_METHODS = [
  {
    id: 'wechat',
    name: '微信支付',
    icon: <Smartphone className="w-6 h-6 text-[#07C160]" />,
    description: '模拟微信支付流程',
    tag: '快捷',
  },
  {
    id: 'alipay',
    name: '支付宝',
    icon: <Wallet className="w-6 h-6 text-[#1677FF]" />,
    description: '模拟支付宝支付流程',
    tag: '推荐',
  },
  {
    id: 'card',
    name: '银联支付',
    icon: <CreditCard className="w-6 h-6 text-[#DC2626]" />,
    description: '模拟银行卡快捷支付',
  },
]

export function PaymentModal({ isOpen, onClose, onSuccess, orderId, amount }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState('wechat')
  const [isPaying, setIsPaying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handlePay = async () => {
    setIsPaying(true)
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await orderService.payOrder(orderId)
      setIsSuccess(true)
      toast.success('支付成功')
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Payment failed', error)
      toast.error('支付失败，请稍后重试')
    } finally {
      setIsPaying(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isPaying && !isSuccess ? onClose : undefined}
          className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="relative border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
            <h3 className="text-lg font-bold text-zinc-900">模拟收银台</h3>
            {!isPaying && !isSuccess && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-zinc-500">应付金额</span>
              <span className="text-2xl font-black text-zinc-900">¥{amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-6">
            {!isSuccess ? (
              <div className="space-y-4">
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 border border-amber-100">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">
                    当前为演示模式，点击“立即支付”即可完成虚拟交易。
                  </p>
                </div>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      disabled={isPaying}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`group relative flex w-full items-center gap-4 rounded-2xl border p-4 transition-all ${
                        selectedMethod === method.id
                          ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
                          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-zinc-100 shadow-sm">
                        {method.icon}
                      </div>
                      <div className="flex flex-1 flex-col items-start transition-transform group-active:scale-95">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{method.name}</span>
                          {method.tag && (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                              {method.tag}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-500">{method.description}</span>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedMethod === method.id
                            ? 'border-indigo-600 bg-indigo-600'
                            : 'border-zinc-300'
                        }`}
                      >
                        {selectedMethod === method.id && (
                          <div className="h-2 w-2 rounded-full bg-white shadow-sm" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handlePay}
                  disabled={isPaying}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-4 text-base font-bold text-white shadow-xl shadow-zinc-200 transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      正在模拟支付...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      立即支付
                    </>
                  )}
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="mb-6 rounded-full bg-emerald-50 p-4 text-emerald-500 ring-8 ring-emerald-50/50">
                  <CheckCircle2 className="h-16 w-16" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">支付成功</h3>
                <p className="mt-2 text-sm text-zinc-500">感谢您的支持，系统正在为您跳转...</p>
                <div className="mt-8 flex w-full flex-col gap-2">
                  <div className="flex justify-between text-xs text-zinc-400 border-t border-zinc-50 pt-4">
                    <span>交易单号</span>
                    <span className="text-zinc-600 font-mono">{orderId.slice(0, 8)}...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
