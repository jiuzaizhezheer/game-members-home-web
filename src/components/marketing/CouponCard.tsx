import React from 'react'
import { motion } from 'framer-motion'
import { Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { CouponOut, UserCouponOut } from '@/features/marketing/types'

interface CouponCardProps {
  coupon?: CouponOut
  userCoupon?: UserCouponOut
  onClaim?: (id: string) => void
  disabled?: boolean
  loading?: boolean
  variant?: 'claim' | 'owned'
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon: propCoupon,
  userCoupon,
  onClaim,
  disabled,
  loading,
  variant = 'claim',
}) => {
  // 优先从 userCoupon 获取 coupon 详情，否则使用 propCoupon
  const coupon = userCoupon?.coupon || propCoupon

  if (!coupon) return null

  const isExpired =
    variant === 'owned' ? userCoupon?.status === 'expired' : coupon.display_status === 'expired'
  const isUsed = userCoupon?.status === 'used'
  const isInactive = coupon.status === 'inactive'
  const isClaimed = coupon.is_claimed

  const canClaim =
    variant === 'claim' && !disabled && !loading && coupon.display_status === 'active' && !isClaimed

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={canClaim ? { y: -2 } : {}}
      className={cn(
        'relative group overflow-hidden rounded-2xl border transition-all duration-300',
        'bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
        isExpired || isUsed || isInactive || isClaimed
          ? 'grayscale opacity-75 border-zinc-200'
          : 'border-zinc-100 hover:border-indigo-100/50',
      )}
    >
      <div className="flex">
        {/* 左侧金额/折扣部分 */}
        <div
          className={cn(
            'w-28 flex flex-col items-center justify-center p-4 border-r border-dashed border-zinc-100 relative',
            isExpired || isUsed || isInactive || isClaimed ? 'bg-zinc-50' : 'bg-indigo-50/30',
          )}
        >
          {/* 装饰性半圆 */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full shadow-inner border border-zinc-100" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white rounded-full shadow-inner border border-zinc-100" />

          <div className="flex items-baseline text-indigo-600 font-bold">
            {coupon.discount_type === 'fixed' ? (
              <>
                <span className="text-sm mr-0.5">¥</span>
                <span className="text-2xl">{Number(coupon.discount_value)}</span>
              </>
            ) : (
              <>
                <span className="text-2xl">{Number(coupon.discount_value)}</span>
                <span className="text-sm ml-0.5">%</span>
              </>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 truncate max-w-full">
            {Number(coupon.min_spend) > 0 ? `满¥${Number(coupon.min_spend)}可用` : '无门槛'}
          </p>
        </div>

        {/* 右侧信息部分 */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1">{coupon.title}</h3>
              {variant === 'owned' && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                    isUsed
                      ? 'bg-zinc-100 text-zinc-500'
                      : isInactive
                        ? 'bg-rose-50 text-rose-600'
                        : isExpired
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-teal-50 text-teal-600',
                  )}
                >
                  {isUsed ? '已使用' : isInactive ? '已下架' : isExpired ? '已过期' : '待使用'}
                </span>
              )}
            </div>
            {coupon.description && (
              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{coupon.description}</p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center text-[10px] text-zinc-400">
                <Clock className="w-3 h-3 mr-1" />
                <span>{new Date(coupon.end_at).toLocaleDateString()} 到期</span>
              </div>

              {variant === 'claim' && coupon.total_quantity > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-400 flex justify-between">
                    <span>
                      已领 {((coupon.issued_count / coupon.total_quantity) * 100).toFixed(0)}%
                    </span>
                    <span>剩余 {coupon.total_quantity - coupon.issued_count} 张</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, (coupon.issued_count / coupon.total_quantity) * 100)}%`,
                      }}
                      className="h-full bg-indigo-500/40"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              {variant === 'claim' && canClaim && (
                <button
                  onClick={() => onClaim?.(coupon.id)}
                  disabled={loading}
                  className={cn(
                    'text-[11px] font-medium text-indigo-600 flex items-center group/btn',
                    'px-3 py-1.5 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors',
                  )}
                >
                  立即领取
                  <ChevronRight className="w-3 h-3 ml-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              )}

              {variant === 'claim' && !canClaim && (
                <span className="text-[11px] font-medium text-zinc-400">
                  {isClaimed
                    ? '已领取'
                    : coupon.display_status === 'pending'
                      ? '未开始'
                      : coupon.display_status === 'expired'
                        ? '已收罄'
                        : '不可领'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 底部装饰线 */}
      {!isExpired && !isUsed && !isInactive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0" />
      )}
    </motion.div>
  )
}

export default CouponCard
