import { useState, useEffect } from 'react'
import { Ticket, Plus, Search, Calendar, Loader2, Power, PowerOff, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { adminApi } from '@/features/admin/api'
import type { AdminCouponItemOut } from '@/features/admin/types'
import AdminCouponCreateModal from './AdminCouponCreateModal'

export default function AdminCouponListPage() {
  const [coupons, setCoupons] = useState<AdminCouponItemOut[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')

  const fetchCoupons = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getCoupons()
      setCoupons(response?.items || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const handleToggleStatus = async (coupon: AdminCouponItemOut) => {
    // 如果是启用操作，直接执行
    if (coupon.status !== 'active') {
      try {
        await adminApi.updateCoupon(coupon.id, { status: 'active' })
        fetchCoupons()
      } catch (error) {
        console.error(error)
      }
      return
    }

    // 如果是停用操作，且尚未进行二次确认
    if (confirmingId !== coupon.id) {
      setConfirmingId(coupon.id)
      // 3秒后自动取消确认状态
      setTimeout(() => setConfirmingId((curr) => (curr === coupon.id ? null : curr)), 3000)
      return
    }

    // 已确认，执行停用
    try {
      await adminApi.updateCoupon(coupon.id, { status: 'inactive' })
      setConfirmingId(null)
      fetchCoupons()
    } catch (error) {
      console.error(error)
    }
  }

  const filteredCoupons = coupons.filter(
    (c) =>
      c.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (c.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ?? false),
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">优惠券管理</h1>
          <p className="mt-1 text-sm text-zinc-500">创建并管理全平台通用或商家的优惠券</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-full bg-rose-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 active:scale-95"
        >
          <Plus size={18} />
          新建官方券
        </button>
      </div>

      {/* Filters/Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="搜索优惠券标题或内容..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full rounded-xl border-zinc-200 py-2.5 pl-10 pr-4 text-sm outline-none ring-rose-500/20 transition-all focus:border-rose-500 focus:ring-4"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="animate-spin text-zinc-300" size={40} />
          <p className="text-sm font-medium text-zinc-400">正在获取数据...</p>
        </div>
      ) : filteredCoupons.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCoupons.map((coupon) => (
            <motion.div
              layout
              key={coupon.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
                coupon.status === 'inactive' ? 'opacity-60 grayscale' : ''
              }`}
            >
              {/* Badge */}
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    coupon.merchant_id
                      ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                      : 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200'
                  }`}
                >
                  {coupon.merchant_id ? '商家券' : '全场通用'}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    coupon.status === 'active'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {coupon.status === 'active' ? '展示中' : '已禁用'}
                </span>
              </div>

              {/* Discount Info */}
              <div className="mb-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-rose-600 leading-none">
                  {coupon.discount_type === 'fixed'
                    ? `¥${Number(coupon.discount_value)}`
                    : `${Number(coupon.discount_value)}%`}
                </span>
                <span className="text-xs font-bold text-zinc-400">
                  {coupon.min_spend > 0 ? `满 ¥${coupon.min_spend} 可用` : '无门槛'}
                </span>
              </div>

              <h3 className="mb-1 font-bold text-zinc-900 group-hover:text-rose-600 transition-colors">
                {coupon.title}
              </h3>
              <p className="mb-4 line-clamp-2 min-h-[32px] text-xs text-zinc-500">
                {coupon.description || '无详细描述'}
              </p>

              {/* Stats */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">已领进度</span>
                  <span className="font-bold text-zinc-600">
                    {coupon.total_quantity === 0
                      ? coupon.issued_count
                      : `${coupon.issued_count}/${coupon.total_quantity}`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{
                      width: `${
                        coupon.total_quantity === 0
                          ? 0
                          : Math.min(100, (coupon.issued_count / coupon.total_quantity) * 100)
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Time */}
              <div className="mb-6 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                <Calendar size={12} />
                <span>有效期至 {new Date(coupon.end_at).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex">
                <button
                  onClick={() => handleToggleStatus(coupon)}
                  className={`w-full rounded-2xl flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all shadow-sm active:scale-95 ${
                    confirmingId === coupon.id
                      ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200'
                      : coupon.status === 'active'
                        ? 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:shadow-inner'
                        : 'bg-rose-50 text-rose-600 hover:bg-rose-100 hover:shadow-rose-100/50'
                  }`}
                >
                  {confirmingId === coupon.id ? (
                    <>
                      <AlertCircle size={16} /> 确认停用？
                    </>
                  ) : coupon.status === 'active' ? (
                    <>
                      <PowerOff size={16} /> 停用此券
                    </>
                  ) : (
                    <>
                      <Power size={16} /> 重新启用
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-100 bg-zinc-50/30 px-4 py-12 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-zinc-200/50">
            <Ticket className="text-zinc-300" size={36} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">暂无优惠券</h3>
          <p className="mt-1 text-sm text-zinc-500">立即创建全平台通用优惠券，吸引更多用户下单。</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-200 transition-all hover:bg-zinc-800 active:scale-95"
          >
            <Plus size={18} />
            创建首个优惠券
          </button>
        </div>
      )}

      {/* Create Modal */}
      <AdminCouponCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchCoupons}
      />
    </div>
  )
}
