import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Loader2,
  ShieldAlert,
  X,
  Mail,
  Calendar,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/features/admin/api'
import type { AdminUserItemOut } from '@/features/admin/types'
import { useDebounce } from '@/hooks/useDebounce'
import { useConfirm } from '@/components/ui/confirmContext'
import { getFileUrl } from '@/shared/utils/file'

const RoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    admin: 'bg-rose-50 text-rose-600 ring-rose-500/20',
    merchant: 'bg-indigo-50 text-indigo-600 ring-indigo-500/20',
    member: 'bg-teal-50 text-teal-600 ring-teal-500/20',
  }
  const labels: Record<string, string> = { admin: '管理员', merchant: '商家', member: '会员' }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[role] ?? styles.member}`}
    >
      {labels[role] ?? role}
    </span>
  )
}

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${isActive ? 'bg-emerald-50 text-emerald-600 ring-emerald-500/20' : 'bg-zinc-100 text-zinc-500 ring-zinc-500/20'}`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
    {isActive ? '正常' : '已禁用'}
  </span>
)

// ——— 用户详情侧边抽屉 ———
function UserDetailDrawer({
  user,
  onClose,
  onToggleActive,
}: {
  user: AdminUserItemOut | null
  onClose: () => void
  onToggleActive: (user: AdminUserItemOut) => void
}) {
  return (
    <AnimatePresence>
      {user && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
              <h2 className="text-base font-semibold text-zinc-900">用户详情</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={getFileUrl(user.avatar_url)}
                      alt={user.username}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-600">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${user.is_active ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-zinc-900">{user.username}</p>
                  <RoleBadge role={user.role} />
                </div>
              </div>

              {/* Info list */}
              <div className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="shrink-0 text-zinc-400" />
                  <span className="text-zinc-500">邮箱</span>
                  <span className="ml-auto font-medium text-zinc-800 break-all">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield size={16} className="shrink-0 text-zinc-400" />
                  <span className="text-zinc-500">账号状态</span>
                  <span className="ml-auto">
                    <StatusBadge isActive={user.is_active} />
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="shrink-0 text-zinc-400" />
                  <span className="text-zinc-500">注册时间</span>
                  <span className="ml-auto font-medium text-zinc-800">
                    {new Date(user.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="h-4 w-4 shrink-0 text-center text-zinc-400 text-xs">#</span>
                  <span className="text-zinc-500">用户 ID</span>
                  <span className="ml-auto font-mono text-xs text-zinc-400 break-all">
                    {String(user.id)}
                  </span>
                </div>
              </div>

              {/* Action */}
              {user.role !== 'admin' && (
                <button
                  onClick={() => onToggleActive(user)}
                  className={`w-full rounded-xl py-2.5 text-sm font-medium transition-colors ${
                    user.is_active
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {user.is_active ? '禁用该账号' : '启用该账号'}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItemOut[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<AdminUserItemOut | null>(null)
  const confirm = useConfirm()

  const [page, setPage] = useState(1)
  const pageSize = 15
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState('')
  const [isActive, setIsActive] = useState<string>('')
  const debouncedKeyword = useDebounce(keyword, 600)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminApi.getUsers({
        page,
        page_size: pageSize,
        keyword: debouncedKeyword || undefined,
        role: role || undefined,
        is_active: isActive === '' ? undefined : isActive === 'true',
      })
      setUsers(res.items)
      setTotal(res.total)
    } catch {
      toast.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedKeyword, role, isActive])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleToggleActive = async (user: AdminUserItemOut) => {
    const action = user.is_active ? '禁用' : '启用'
    if (
      !(await confirm({
        title: `${action}用户`,
        description: `确定要${action}用户 "${user.username}" 吗？`,
        confirmText: action,
        cancelText: '取消',
        variant: user.is_active ? 'danger' : 'default',
      }))
    )
      return

    try {
      if (user.is_active) {
        await adminApi.disableUser(user.id)
      } else {
        await adminApi.enableUser(user.id)
      }
      toast.success(`${action}成功`)
      const updated = { ...user, is_active: !user.is_active }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
      if (selectedUser?.id === user.id) setSelectedUser(updated)
    } catch {
      toast.error(`${action}失败`)
    }
  }

  return (
    <div className="space-y-6">
      {/* User Detail Drawer */}
      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onToggleActive={handleToggleActive}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">用户管理</h1>
          <p className="mt-1 text-sm text-zinc-500">共 {total} 位用户</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <Users size={20} className="text-indigo-600" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="搜索用户名 / 邮箱..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
                setPage(1)
              }}
              className="h-10 appearance-none rounded-xl border border-zinc-200 bg-white pl-4 pr-9 text-sm font-medium text-zinc-700 outline-none transition-all focus:border-indigo-500 hover:border-zinc-300"
            >
              <option value="">全部角色</option>
              <option value="member">会员</option>
              <option value="merchant">商家</option>
              <option value="admin">管理员</option>
            </select>
            <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          </div>
          <div className="relative">
            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value)
                setPage(1)
              }}
              className="h-10 appearance-none rounded-xl border border-zinc-200 bg-white pl-4 pr-9 text-sm font-medium text-zinc-700 outline-none transition-all focus:border-indigo-500 hover:border-zinc-300"
            >
              <option value="">全部状态</option>
              <option value="true">正常</option>
              <option value="false">已禁用</option>
            </select>
            <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-zinc-50/80 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">用户</th>
                <th className="px-6 py-4 font-medium">邮箱</th>
                <th className="px-6 py-4 font-medium">角色</th>
                <th className="px-6 py-4 font-medium">状态</th>
                <th className="px-6 py-4 font-medium">注册时间</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                      <Users className="h-10 w-10 text-zinc-200" />
                      <span>暂无用户数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedUser(user)}
                    className="group cursor-pointer transition-colors hover:bg-zinc-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-zinc-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isActive={user.is_active} />
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {user.role !== 'admin' ? (
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${user.is_active ? 'text-zinc-400 hover:bg-rose-50 hover:text-rose-500' : 'text-zinc-400 hover:bg-emerald-50 hover:text-emerald-500'}`}
                            title={user.is_active ? '禁用用户' : '启用用户'}
                          >
                            {user.is_active ? <UserCheck size={16} /> : <UserX size={16} />}
                          </button>
                        ) : (
                          <ShieldAlert size={16} className="text-zinc-200" />
                        )}
                        <ChevronRight
                          size={14}
                          className="text-zinc-300 group-hover:text-zinc-400"
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
