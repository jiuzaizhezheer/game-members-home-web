import { useState, useEffect } from 'react'
import { Calendar, User, Tag, ChevronLeft, ChevronRight, Loader2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { adminApi } from '@/features/admin/api'
import type { AdminLogItem } from '@/features/admin/types'
import { toast } from 'sonner'

/** 操作类型标签映射 */
const ACTION_LABEL: Record<string, string> = {
  disable_user: '禁用用户',
  enable_user: '启用用户',
  verify_merchant: '审核商家',
  force_offline_product: '强制下架商品',
  review_post: '审核帖子',
  delete_post: '删除帖子',
  delete_comment: '删除评论',
  create_group: '创建社群',
}

/** 目标类型颜色映射 */
const TARGET_COLOR: Record<string, string> = {
  user: 'bg-blue-50 text-blue-600 border-blue-100',
  merchant: 'bg-amber-50 text-amber-600 border-amber-100',
  product: 'bg-rose-50 text-rose-600 border-rose-100',
  post: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  comment: 'bg-zinc-50 text-zinc-600 border-zinc-100',
  group: 'bg-emerald-50 text-emerald-600 border-emerald-100',
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLogItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const pageSize = 15

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getLogs({ page, page_size: pageSize })
      setLogs(res.items)
      setTotal(res.total)
    } catch (error) {
      toast.error('获取日志失败')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">操作日志</h1>
          <p className="mt-1 text-sm text-zinc-500">记录全平台管理员的所有敏感操作审计</p>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-zinc-500 shadow-sm ring-1 ring-zinc-200">
          <Calendar size={16} />
          <span>全量审计</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/50 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">操作时间</th>
                <th className="px-6 py-4 font-medium">管理员 ID</th>
                <th className="px-6 py-4 font-medium">操作类型</th>
                <th className="px-6 py-4 font-medium">目标对象</th>
                <th className="px-6 py-4 font-medium">详情描述</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-rose-500" />
                    <p className="mt-2 text-zinc-400">正在加载审计数据...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-zinc-400">
                    暂无相关操作记录
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={log.id}
                    className="group transition-colors hover:bg-zinc-50/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 transition-colors group-hover:text-zinc-900">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Clock size={14} />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-zinc-300" />
                        {log.admin_id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600 ring-1 ring-inset ring-rose-100">
                        {ACTION_LABEL[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${TARGET_COLOR[log.target_type] || 'bg-gray-50 text-gray-600 border-gray-100'}`}
                      >
                        <Tag size={12} />
                        {log.target_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="max-w-[300px] truncate text-zinc-600"
                        title={JSON.stringify(log.detail)}
                      >
                        {log.detail ? (
                          Object.entries(log.detail)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')
                        ) : (
                          <span className="text-zinc-300">无详情内容</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-6 py-4">
            <p className="text-sm text-zinc-500">
              共 <span className="font-medium text-zinc-900">{total}</span> 条记录
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition-all hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center px-4 text-sm font-medium text-zinc-900">
                第 {page} / {totalPages} 页
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition-all hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
