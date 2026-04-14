import { useState, useEffect } from 'react'
import { Plus, Loader2, MessageCircle, Image as ImageIcon, Trash2, Edit2 } from 'lucide-react'
import { adminApi } from '@/features/admin/api'
import { communityApi } from '@/features/community/api'
import type { GroupItemOut, GroupCreateIn } from '@/features/community/types'
import { getFileUrl } from '@/shared/utils/file'
import { commonApi } from '@/features/common/api'

export default function AdminCommunityPage() {
  const [groups, setGroups] = useState<GroupItemOut[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [formData, setFormData] = useState<GroupCreateIn>({
    name: '',
    description: '',
    cover_image: '',
  })

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const res = await communityApi.getGroups(1, 100)
      setGroups(res.items)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const { url } = await commonApi.uploadFile(file)
      setFormData((prev) => ({ ...prev, cover_image: url }))
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSubmitting(true)
    try {
      await adminApi.createCommunityGroup(formData)
      setIsCreateModalOpen(false)
      setFormData({ name: '', description: '', cover_image: '' })
      fetchGroups()
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const message = err.response?.data?.message || err.message || '创建失败'
      console.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">社群话题圈管理</h1>
          <p className="text-sm text-zinc-500">管理官方话题圈、公告及内容生态</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700 active:scale-95"
        >
          <Plus size={18} />
          创建话题圈
        </button>
      </div>

      {/* List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-zinc-100" />
          ))
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <div
              key={group.id}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-xl hover:shadow-zinc-200/50"
            >
              {/* Cover */}
              <div className="h-24 w-full bg-zinc-100 relative overflow-hidden">
                {group.cover_image && (
                  <img
                    src={getFileUrl(group.cover_image)}
                    className="h-full w-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                  <MessageCircle size={16} />
                  <span className="text-sm font-bold">{group.name}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="line-clamp-2 text-xs text-zinc-500 min-h-[32px]">
                  {group.description || '暂无描述'}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-zinc-50 pt-3">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-xs font-bold text-zinc-900">{group.member_count}</p>
                      <p className="text-[10px] text-zinc-400">成员</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-zinc-900">{group.post_count}</p>
                      <p className="text-[10px] text-zinc-400">帖子</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="rounded-full p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button className="rounded-full p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-zinc-100">
            <MessageCircle className="mb-4 h-12 w-12 text-zinc-200" />
            <p className="text-zinc-500">还一个圈子都没有呢</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !submitting && setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200 rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-zinc-900 text-center">开启新话题圈</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-500 ml-1">
                  圈子名称
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none"
                  placeholder="如：原神交流区"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-500 ml-1">描述</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none resize-none"
                  rows={3}
                  placeholder="介绍一下这个圈子吧..."
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-zinc-500 ml-1 flex items-center gap-1">
                  <ImageIcon size={14} />
                  <span>封面图</span>
                </label>
                <div className="space-y-3">
                  <label className="group relative block aspect-[16/9] w-40 mx-auto cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:border-rose-500 active:scale-[0.99]">
                    {formData.cover_image ? (
                      <img
                        src={getFileUrl(formData.cover_image)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-zinc-400 group-hover:text-rose-500">
                        {uploading ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          <>
                            <Plus className="mb-2 h-8 w-8 transition-transform group-hover:rotate-90" />
                            <span className="text-xs font-semibold">点击上传封面</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Hover Overlay */}
                    {formData.cover_image && !uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        更换图片
                      </div>
                    )}

                    {/* Uploading Overlay */}
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
                      </div>
                    )}

                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                  </label>
                  <p className="text-[10px] text-center text-zinc-400">
                    支持 JPG、PNG、WebP 格式，建议比例 16:9
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-full border border-zinc-200 py-3 text-sm font-bold text-zinc-500 hover:bg-zinc-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.name}
                  className="flex-1 rounded-full bg-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : '立即开启'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
