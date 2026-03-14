import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, History } from 'lucide-react'
import { couponApi } from '@/features/marketing/api'
import type { UserCouponOut } from '@/features/marketing/types'
import { cn } from '@/shared/utils/cn'
import CouponCard from '@/components/marketing/CouponCard'

const MyCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<UserCouponOut[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState<'unused' | 'used' | 'inactive' | 'expired'>(
    'unused',
  )

  const fetchMyCoupons = async (status: string) => {
    try {
      setLoading(true)
      const res = await couponApi.getMyCoupons({ status })
      setCoupons(res)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyCoupons(currentStatus)
  }, [currentStatus])

  return (
    <div className="min-h-screen bg-zinc-50/50 pt-20 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">我的优惠券</h1>
            <p className="text-zinc-500 text-xs mt-1">管理您所有的福利与优惠</p>
          </div>

          <div className="flex bg-white rounded-full p-1 border border-zinc-100 shadow-sm">
            {(['unused', 'used', 'inactive', 'expired'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setCurrentStatus(status)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                  currentStatus === status
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-500 hover:text-zinc-900',
                )}
              >
                {status === 'unused'
                  ? '待使用'
                  : status === 'used'
                    ? '已核销'
                    : status === 'inactive'
                      ? '已下架'
                      : '已过期'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-2xl border border-zinc-100 animate-pulse"
              />
            ))}
          </div>
        ) : coupons.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {coupons.map((item) => (
                <CouponCard key={item.id} userCoupon={item} variant="owned" />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
            {currentStatus === 'unused' ? (
              <>
                <Ticket className="w-16 h-16 mb-4 opacity-10" />
                <p>还没有可用的优惠券</p>
                <button
                  onClick={() => (window.location.href = '/member/coupons')}
                  className="mt-4 text-xs font-medium text-indigo-600 hover:underline"
                >
                  去领券中心逛逛
                </button>
              </>
            ) : (
              <>
                <History className="w-16 h-16 mb-4 opacity-10" />
                <p>暂无历史记录</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCouponsPage
