import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, Flag, Loader2, X } from 'lucide-react'
import { adminApi } from '@/features/admin/api'
import type {
  AdminReportDetailOut,
  AdminReportItemOut,
  ReportHandleIn,
  ReportResult,
  ReportStatus,
  ReportTargetType,
} from '@/features/admin/types'
import { getFileUrl } from '@/shared/utils/file'

const STATUS_LABEL: Record<ReportStatus, string> = {
  pending: '待处理',
  handled: '已处理',
}

const RESULT_LABEL: Record<ReportResult, string> = {
  success: '举报成立',
  fail: '举报不成立',
}

const TARGET_LABEL: Record<ReportTargetType, string> = {
  post: '帖子',
  comment: '评论',
  product: '商品',
}

const REASON_LABEL: Record<string, string> = {
  spam: '垃圾广告',
  abuse: '辱骂攻击',
  porn: '色情低俗',
  illegal: '违法违规',
  fraud: '诈骗信息',
  other: '其他',
}

export default function AdminReportsPage() {
  const [items, setItems] = useState<AdminReportItemOut[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 15
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<ReportStatus | 'all'>('pending')
  const [targetType, setTargetType] = useState<ReportTargetType | 'all'>('all')

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<AdminReportDetailOut | null>(null)
  const [handledNote, setHandledNote] = useState('')
  const [handling, setHandling] = useState(false)

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total])

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getReports({
        page,
        page_size: pageSize,
        status: status === 'all' ? undefined : status,
        target_type: targetType === 'all' ? undefined : targetType,
      })
      setItems(res.items)
      setTotal(res.total)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [page, status, targetType])

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  const openDetail = async (reportId: string) => {
    setDetailOpen(true)
    setDetail(null)
    setHandledNote('')
    setDetailLoading(true)
    try {
      const res = await adminApi.getReportDetail(reportId)
      setDetail(res)
    } catch (error) {
      console.error(error)
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const submitHandle = async (payload: ReportHandleIn) => {
    if (!detail?.report?.id) return
    if (handling) return
    setHandling(true)
    try {
      await adminApi.handleReport(detail.report.id, payload)
      setDetailOpen(false)
      await fetchList()
    } catch (error) {
      console.error(error)
    } finally {
      setHandling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">举报管理</h1>
          <p className="mt-1 text-sm text-zinc-500">处理用户提交的帖子/评论/商品举报工单</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => {
              setPage(1)
              setStatus(e.target.value as ReportStatus | 'all')
            }}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 shadow-sm"
          >
            <option value="pending">待处理</option>
            <option value="handled">已处理</option>
            <option value="all">全部</option>
          </select>
          <select
            value={targetType}
            onChange={(e) => {
              setPage(1)
              setTargetType(e.target.value as ReportTargetType | 'all')
            }}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 shadow-sm"
          >
            <option value="all">全部类型</option>
            <option value="post">帖子</option>
            <option value="comment">评论</option>
            <option value="product">商品</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/50 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">提交时间</th>
                <th className="px-6 py-4 font-medium">举报人</th>
                <th className="px-6 py-4 font-medium">目标</th>
                <th className="px-6 py-4 font-medium">原因</th>
                <th className="px-6 py-4 font-medium">状态</th>
                <th className="px-6 py-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-rose-500" />
                    <p className="mt-2 text-zinc-400">正在加载...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-zinc-400">
                    暂无举报记录
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} className="group transition-colors hover:bg-zinc-50/50">
                    <td className="whitespace-nowrap px-6 py-4 text-zinc-500">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 overflow-hidden rounded-full bg-zinc-100">
                          {r.reporter_avatar_url ? (
                            <img
                              src={getFileUrl(r.reporter_avatar_url)}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-zinc-900">
                            {r.reporter_name}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {r.reporter_id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Flag size={14} className="text-zinc-300" />
                        <span className="font-medium">{TARGET_LABEL[r.target_type]}</span>
                        <span className="text-xs text-zinc-400">{r.target_id.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {REASON_LABEL[r.reason] || r.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${
                          r.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 ring-amber-100'
                            : 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                        }`}
                      >
                        {STATUS_LABEL[r.status]}
                      </span>
                      {r.status === 'handled' && r.result ? (
                        <div className="mt-1 text-[11px] font-semibold text-zinc-500">
                          {RESULT_LABEL[r.result]}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openDetail(r.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                      >
                        <Eye size={14} />
                        查看
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-6 py-4">
            <p className="text-sm text-zinc-500">
              共 <span className="font-medium text-zinc-900">{total}</span> 条
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                上一页
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
              >
                下一页
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {detailOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !handling && setDetailOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <Flag size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">举报详情</h3>
                    <p className="text-xs text-zinc-400">{detail?.report?.id?.slice(0, 8)}...</p>
                  </div>
                </div>
                <button
                  onClick={() => !handling && setDetailOpen(false)}
                  className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 p-6">
                {detailLoading ? (
                  <div className="py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-rose-500" />
                    <p className="mt-2 text-zinc-400">正在加载详情...</p>
                  </div>
                ) : !detail ? (
                  <div className="py-16 text-center text-zinc-400">暂无数据</div>
                ) : (
                  <>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                        <div className="text-xs font-bold text-zinc-500">目标</div>
                        <div className="mt-1 text-sm font-semibold text-zinc-900">
                          {TARGET_LABEL[detail.report.target_type]}
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">{detail.report.target_id}</div>
                        {detail.target_preview ? (
                          <div className="mt-2 line-clamp-2 text-xs text-zinc-600">
                            {detail.target_preview}
                          </div>
                        ) : null}
                      </div>
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                        <div className="text-xs font-bold text-zinc-500">举报人</div>
                        <div className="mt-1 text-sm font-semibold text-zinc-900">
                          {detail.report.reporter_name}
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                          {detail.report.reporter_id}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                      <div className="text-xs font-bold text-zinc-500">原因</div>
                      <div className="mt-1 text-sm text-zinc-900">
                        {REASON_LABEL[detail.report.reason] || detail.report.reason}
                      </div>
                      {detail.report.description ? (
                        <div className="mt-2 text-sm text-zinc-600 whitespace-pre-wrap">
                          {detail.report.description}
                        </div>
                      ) : null}
                    </div>

                    {detail.report.evidence_urls.length > 0 && (
                      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                        <div className="text-xs font-bold text-zinc-500">证据图片</div>
                        <div className="mt-3 grid grid-cols-4 gap-2">
                          {detail.report.evidence_urls.map((u) => (
                            <a
                              key={u}
                              href={getFileUrl(u)}
                              target="_blank"
                              rel="noreferrer"
                              className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
                            >
                              <img src={getFileUrl(u)} className="h-16 w-full object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {detail.report.status === 'pending' ? (
                      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                        <div className="text-xs font-bold text-zinc-500">处理备注（可选）</div>
                        <textarea
                          value={handledNote}
                          onChange={(e) => setHandledNote(e.target.value)}
                          rows={3}
                          placeholder="请输入处理说明"
                          className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition-all focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                        />
                        <div className="mt-3 flex gap-3">
                          <button
                            onClick={() =>
                              submitHandle({
                                result: 'fail',
                                handled_note: handledNote.trim() ? handledNote.trim() : null,
                              })
                            }
                            disabled={handling}
                            className="flex-1 rounded-full border border-zinc-200 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                          >
                            举报不成立
                          </button>
                          <button
                            onClick={() =>
                              submitHandle({
                                result: 'success',
                                handled_note: handledNote.trim() ? handledNote.trim() : null,
                              })
                            }
                            disabled={handling}
                            className="flex-1 rounded-full bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {handling ? (
                              <Loader2 size={18} className="mx-auto animate-spin" />
                            ) : (
                              <span className="inline-flex items-center justify-center gap-1.5">
                                <CheckCircle2 size={18} />
                                举报成立并下架
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                        <div className="text-xs font-bold text-zinc-500">处理结果</div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-900">
                            {STATUS_LABEL[detail.report.status]}
                          </span>
                          {detail.report.result ? (
                            <span className="text-xs font-semibold text-zinc-600">
                              {RESULT_LABEL[detail.report.result]}
                            </span>
                          ) : null}
                          {detail.report.handled_at ? (
                            <span className="text-xs text-zinc-400">
                              {new Date(detail.report.handled_at).toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                        {detail.report.handled_note ? (
                          <div className="mt-2 text-sm text-zinc-600 whitespace-pre-wrap">
                            {detail.report.handled_note}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
