import { useState, useEffect, useCallback } from 'react'
import { Store, Search, Loader2, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { adminApi } from '@/features/admin/api'
import type { AdminMerchantItemOut } from '@/features/admin/types'
import { useDebounce } from '@/hooks/useDebounce'
import { useConfirm } from '@/components/ui/confirmContext'

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<AdminMerchantItemOut[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const confirm = useConfirm()

  const [page, setPage] = useState(1)
  const pageSize = 15
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 600)

  const fetchMerchants = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminApi.getMerchants({
        page,
        page_size: pageSize,
        keyword: debouncedKeyword || undefined,
      })
      setMerchants(res.items)
      setTotal(res.total)
    } catch {
      toast.error('获取商家列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedKeyword])

  useEffect(() => {
    fetchMerchants()
  }, [fetchMerchants])

  const handleVerify = async (m: AdminMerchantItemOut) => {
    const action = m.is_active ? '禁用' : '启用'
    if (
      !(await confirm({
        title: `${action}商家`,
        description: `确定要${action}商家 "${m.shop_name}" 的账号吗？`,
        confirmText: action,
        cancelText: '取消',
        variant: m.is_active ? 'danger' : 'default',
      }))
    )
      return

    try {
      await adminApi.verifyMerchant(m.merchant_id, !m.is_active)
      toast.success(`${action}成功`)
      setMerchants((prev) =>
        prev.map((item) =>
          item.merchant_id === m.merchant_id ? { ...item, is_active: !m.is_active } : item,
        ),
      )
    } catch {
      toast.error(`${action}失败`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">商家管理</h1>
          <p className="mt-1 text-sm text-zinc-500">共 {total} 个商家</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
          <Store size={20} className="text-teal-600" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="搜索店铺名 / 用户名..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-zinc-50/80 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">店铺名称</th>
                <th className="px-6 py-4 font-medium">账号</th>
                <th className="px-6 py-4 font-medium">联系电话</th>
                <th className="px-6 py-4 font-medium">账号状态</th>
                <th className="px-6 py-4 font-medium">入驻时间</th>
                <th className="px-6 py-4 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : merchants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                      <Store className="h-10 w-10 text-zinc-200" />
                      <span>暂无商家数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                merchants.map((m) => (
                  <motion.tr
                    key={m.merchant_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group transition-colors hover:bg-zinc-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-xs font-semibold text-teal-600">
                          {m.shop_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{m.shop_name}</div>
                          {m.shop_desc && (
                            <div className="line-clamp-1 text-xs text-zinc-400">{m.shop_desc}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-700">{m.username}</div>
                      <div className="text-xs text-zinc-400">{m.email}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {m.contact_phone ?? <span className="text-zinc-300">未填写</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          m.is_active
                            ? 'bg-emerald-50 text-emerald-600 ring-emerald-500/20'
                            : 'bg-zinc-100 text-zinc-500 ring-zinc-500/20'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${m.is_active ? 'bg-emerald-500' : 'bg-zinc-400'}`}
                        />
                        {m.is_active ? '正常' : '已禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleVerify(m)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ml-auto ${
                          m.is_active
                            ? 'text-zinc-400 hover:bg-rose-50 hover:text-rose-500'
                            : 'text-zinc-400 hover:bg-emerald-50 hover:text-emerald-500'
                        }`}
                        title={m.is_active ? '禁用商家' : '启用商家'}
                      >
                        {m.is_active ? <UserCheck size={16} /> : <UserX size={16} />}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-6 py-4">
            <div className="text-sm text-zinc-500">
              第 {page} / {Math.ceil(total / pageSize)} 页，共 {total} 条
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                上一页
              </button>
              <button
                disabled={page * pageSize >= total}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
