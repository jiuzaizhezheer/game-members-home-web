import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, TicketPercent, Loader2, ArrowRight, Edit, Trash2, Calendar } from 'lucide-react'
import { promotionApi } from '@/features/marketing/api'
import type { PromotionOut } from '@/features/marketing/types'
import { PROMOTION_STATUS, DISCOUNT_TYPES } from '@/features/marketing/constants'
import { formatDate } from '@/shared/utils/date'
import { cn } from '@/shared/utils/cn'

export default function PromotionListPage() {
  const [promotions, setPromotions] = useState<PromotionOut[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const res = await promotionApi.list({ page: 1, page_size: 100 })
      setPromotions(res.items)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('确定要删除这个活动吗？')) return
    try {
      await promotionApi.delete(id)
      fetchPromotions()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">营销活动</h1>
          <p className="mt-1 text-sm text-zinc-500">创建和管理店铺促销活动</p>
        </div>
        <Link
          to="/merchant/marketing/promotions/create"
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          创建活动
        </Link>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-indigo-500" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
          <div className="mb-4 rounded-full bg-indigo-50 p-4">
            <TicketPercent size={32} className="text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">暂无促销活动</h3>
          <p className="mt-1 text-sm text-zinc-500">开始创建一个新的促销活动来吸引顾客吧</p>
          <Link
            to="/merchant/marketing/promotions/create"
            className="mt-6 flex items-center gap-2 font-bold text-indigo-600 hover:text-indigo-700"
          >
            立即创建 <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="group relative overflow-hidden rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-zinc-900">{promo.title}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-bold',
                        promo.display_status === PROMOTION_STATUS.ACTIVE &&
                          'bg-emerald-50 text-emerald-600',
                        promo.display_status === PROMOTION_STATUS.PENDING &&
                          'bg-indigo-50 text-indigo-600',
                        promo.display_status === PROMOTION_STATUS.EXPIRED &&
                          'bg-rose-50 text-rose-600',
                        promo.display_status === PROMOTION_STATUS.INACTIVE &&
                          'bg-zinc-100 text-zinc-500',
                      )}
                    >
                      {promo.display_status === PROMOTION_STATUS.ACTIVE && '进行中'}
                      {promo.display_status === PROMOTION_STATUS.PENDING && '未开始'}
                      {promo.display_status === PROMOTION_STATUS.EXPIRED && '已过期'}
                      {promo.display_status === PROMOTION_STATUS.INACTIVE && '已停用'}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {promo.discount_type === DISCOUNT_TYPES.PERCENT
                        ? `优惠 ${promo.discount_value}%`
                        : `减免 ¥${promo.discount_value}`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/merchant/marketing/promotions/${promo.id}/edit`}
                    className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={(e) => handleDelete(promo.id, e)}
                    className="rounded-full p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(promo.start_at)}
                  <span className="mx-1">→</span>
                  {formatDate(promo.end_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
