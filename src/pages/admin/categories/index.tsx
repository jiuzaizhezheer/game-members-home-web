import { useCallback, useEffect, useMemo, useState } from 'react'
import { FolderTree, Loader2, Plus, Save, Trash2, X } from 'lucide-react'
import { useConfirm } from '@/components/ui/confirmContext'
import { adminApi } from '@/features/admin/api'
import type { CategoryOut } from '@/features/category/types'

type CategoryFormState = {
  name: string
  slug: string
}

const emptyForm: CategoryFormState = { name: '', slug: '' }

export default function AdminCategoriesPage() {
  const confirm = useConfirm()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<CategoryOut[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryFormState>(emptyForm)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminApi.getCategories()
      setCategories(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = form.name.trim()
    const slug = form.slug.trim()

    if (!name || !slug) {
      return
    }

    try {
      if (editingId) {
        const updated = await adminApi.updateCategory(editingId, {
          name,
          slug,
        })
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        resetForm()
        return
      }

      const created = await adminApi.createCategory({
        name,
        slug,
      })
      setCategories((prev) => [created, ...prev])
      setForm(emptyForm)
    } catch (err) {
      console.error(err)
    }
  }

  const startEdit = (category: CategoryOut) => {
    setEditingId(category.id)
    setForm({
      name: category.name,
      slug: category.slug,
    })
  }

  const handleDelete = async (category: CategoryOut) => {
    if (
      !(await confirm({
        title: '删除分类',
        description: `确定要删除分类 "${category.name}" 吗？`,
        confirmText: '删除',
        cancelText: '取消',
        variant: 'danger',
      }))
    )
      return

    try {
      await adminApi.deleteCategory(category.id)
      setCategories((prev) => prev.filter((c) => c.id !== category.id))
      if (editingId === category.id) resetForm()
    } catch (err) {
      console.error(err)
    }
  }

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name))
  }, [categories])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">分类管理</h1>
          <p className="mt-1 text-sm text-zinc-500">用于用户端筛选与商家商品归类</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
          <FolderTree size={20} className="text-rose-600" />
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-zinc-600">名称</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="例如：游戏"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-zinc-600">英文名</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              placeholder="例如：games"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-95"
            >
              {editingId ? <Save size={16} /> : <Plus size={16} />}
              {editingId ? '保存' : '创建'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95"
              >
                <X size={16} />
                取消
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-zinc-50/80 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">名称</th>
                <th className="px-6 py-4 font-medium">英文名</th>
                <th className="px-6 py-4 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-zinc-400">
                    暂无分类，请先创建
                  </td>
                </tr>
              ) : (
                sortedCategories.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-zinc-50/70">
                    <td className="px-6 py-4">
                      <span className="font-medium text-zinc-900">{c.name}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{c.slug}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
