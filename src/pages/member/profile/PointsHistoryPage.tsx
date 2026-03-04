import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react'
import { userService } from '@/features/user/service'
import type { PointLogListOut, UserOut } from '@/features/user/types'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/shared/utils/cn'

export default function PointsHistoryPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserOut | null>(null)
  const [history, setHistory] = useState<PointLogListOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [u, h] = await Promise.all([
        userService.getMe(),
        userService.getPointLogs(page, pageSize),
      ])
      setProfile(u)
      setHistory(h)
    } catch (error) {
      console.error('Failed to fetch points history', error)
      toast.error('历史数据加载失败')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors group"
      >
        <div className="rounded-full bg-zinc-100 p-1 group-hover:bg-zinc-200">
          <ChevronLeft className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">返回个人中心</span>
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">积分明细</h1>
        <p className="mt-1 text-sm text-zinc-500">查看您的积分获取和使用记录</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Summary Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm overflow-hidden relative group">
            <div className="absolute -right-4 -top-8 text-indigo-50/50 transition-colors group-hover:text-indigo-50">
              <Coins className="h-32 w-32 rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                  <Coins className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-zinc-900">当前积分</h3>
              </div>
              <p className="text-4xl font-black text-indigo-600 tracking-tight">
                {profile?.points || 0}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                <Calendar className="h-3 w-3" />
                <span>
                  最后变动：
                  {history?.items[0]
                    ? new Date(history.items[0].created_at).toLocaleString()
                    : '暂无变动'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: History List */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden min-h-[400px]">
            <div className="border-b border-zinc-100 bg-zinc-50/5 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold text-zinc-900">变动记录</h3>
              </div>
              <span className="text-xs font-medium text-zinc-400">共 {history?.total || 0} 条</span>
            </div>

            <div className="divide-y divide-zinc-100">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <p className="text-sm text-zinc-400">正在获取记录...</p>
                </div>
              ) : history?.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="rounded-full bg-zinc-50 p-4">
                    <AlertCircle className="h-8 w-8 text-zinc-300" />
                  </div>
                  <p className="text-sm text-zinc-400">暂无积分变动记录</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {history?.items.map((log) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={log.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'rounded-xl p-2.5',
                            log.change_amount > 0
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600',
                          )}
                        >
                          {log.change_amount > 0 ? (
                            <ArrowUpRight className="h-5 w-5" />
                          ) : (
                            <ArrowDownLeft className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{log.reason}</p>
                          <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5 font-medium">
                            <Calendar className="h-3 w-3" />
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            'text-lg font-black tracking-tight',
                            log.change_amount > 0 ? 'text-emerald-600' : 'text-rose-600',
                          )}
                        >
                          {log.change_amount > 0 ? '+' : ''}
                          {log.change_amount}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                          积分 {log.balance_after}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Pagination */}
            {history && history.total > pageSize && (
              <div className="border-t border-zinc-100 px-6 py-4 flex items-center justify-center gap-4">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(page - 1)}
                  className="rounded-full px-4 py-1.5 text-xs font-bold text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  上一页
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-zinc-900">{page}</span>
                  <span className="text-xs font-bold text-zinc-300">/</span>
                  <span className="text-xs font-bold text-zinc-400">
                    {Math.ceil(history.total / pageSize)}
                  </span>
                </div>
                <button
                  disabled={page >= Math.ceil(history.total / pageSize) || loading}
                  onClick={() => setPage(page + 1)}
                  className="rounded-full px-4 py-1.5 text-xs font-bold text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
