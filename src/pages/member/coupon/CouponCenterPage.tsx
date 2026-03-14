import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Gift, Sparkles } from 'lucide-react'
import { couponApi } from '@/features/marketing/api'
import type { CouponOut } from '@/features/marketing/types'
import CouponCard from '@/components/marketing/CouponCard'

const CouponCenterPage: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponOut[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await couponApi.getCenter()
      setCoupons(res)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleClaim = async (couponId: string) => {
    try {
      setClaimingId(couponId)
      await couponApi.claim(couponId)
    } catch (error) {
      console.error(error)
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20">
      <div className="bg-white border-b border-zinc-100 pt-16 pb-12 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-4"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">领券中心</h1>
        <p className="text-zinc-500 mt-2 text-sm">在这里发现超值福利，优惠不停歇</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-2xl border border-zinc-100 animate-pulse"
              />
            ))}
          </div>
        ) : coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onClaim={handleClaim}
                loading={claimingId === coupon.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
            <Ticket className="w-16 h-16 mb-4 opacity-20" />
            <p>暂无可领取的优惠券</p>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto mt-20 px-4 text-center text-zinc-400 text-xs leading-loose">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Gift className="w-4 h-4 opacity-50" />
          <span className="font-medium">温馨提示</span>
        </div>
        <p>1. 优惠券领取后将存入您的个人账户，可在“我的 - 优惠券”中查看。</p>
        <p>2. 每张优惠券均有有效期限制，请在有效期内使用，逾期将自动失效。</p>
        <p>3. 部分优惠券限特定商家或满额可用，使用规则请以具体券面说明为准。</p>
      </div>
    </div>
  )
}

export default CouponCenterPage
