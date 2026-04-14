import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit2,
  AlertCircle,
  CheckCircle,
  EyeOff,
  Loader2,
  Image as ImageIcon,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { merchantApi } from '@/features/merchant/api'
import type { GroupItemOut, PostItemOut } from '@/features/community/types'
import { commonApi } from '@/features/common/api'
import { getFileUrl } from '@/shared/utils/file'

// Tab Components
const GroupManagement = () => {
  const [groups, setGroups] = useState<GroupItemOut[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<GroupItemOut | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form State
  const [formData, setFormData] = useState({ name: '', description: '', cover_image: '' })

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const res = await merchantApi.getMyGroups()
      setGroups(res.items || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleCreate = () => {
    setEditingGroup(null)
    setFormData({ name: '', description: '', cover_image: '' })
    setIsModalOpen(true)
  }

  const handleEdit = (group: GroupItemOut) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description || '',
      cover_image: group.cover_image || '',
    })
    setIsModalOpen(true)
  }

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
      if (editingGroup) {
        await merchantApi.updateGroup(editingGroup.id, formData)
      } else {
        await merchantApi.createGroup(formData)
      }
      setIsModalOpen(false)
      fetchGroups()
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">话题圈管理</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700 active:scale-95"
        >
          <Plus size={18} />
          新建话题圈
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group.id}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-xl hover:shadow-zinc-200/50"
          >
            {/* Cover */}
            <div className="h-24 w-full bg-zinc-100 relative overflow-hidden">
              {group.cover_image && (
                <img
                  src={getFileUrl(group.cover_image)}
                  alt={group.name}
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
                  <button
                    onClick={() => handleEdit(group)}
                    className="rounded-full p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {groups.length === 0 && !loading && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-zinc-100">
            <MessageCircle className="mb-4 h-12 w-12 text-zinc-200" />
            <p className="text-zinc-500">还一个圈子都没有呢</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !submitting && setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200 rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-zinc-900 text-center">
              {editingGroup ? '编辑话题圈' : '开启新话题圈'}
            </h2>

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
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-full border border-zinc-200 py-3 text-sm font-bold text-zinc-500 hover:bg-zinc-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.name}
                  className="flex-1 rounded-full bg-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin mx-auto" />
                  ) : editingGroup ? (
                    '保存修改'
                  ) : (
                    '立即开启'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const PostModeration = () => {
  const [posts, setPosts] = useState<PostItemOut[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await merchantApi.getPendingPosts() // Currently gets all posts sorted by new
      setPosts(res.items || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleToggleHide = async (post: PostItemOut) => {
    try {
      await merchantApi.moderatePost(post.id, !post.is_hidden)
      toast.success(post.is_hidden ? '帖子已显示' : '帖子已隐藏')
      // Optimistic update or refresh
      setPosts(posts.map((p) => (p.id === post.id ? { ...p, is_hidden: !p.is_hidden } : p)))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">内容审核</h2>
        <div className="flex gap-2">
          <button onClick={fetchPosts} className="text-sm text-indigo-600 hover:underline">
            刷新
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`flex flex-col gap-4 rounded-xl border p-4 transition-all sm:flex-row ${
              post.is_hidden ? 'border-amber-200 bg-amber-50/50' : 'border-zinc-200 bg-white'
            }`}
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                  {post.group_name}
                </span>
                <span className="text-sm font-medium text-zinc-900">{post.author_name}</span>
                <span className="text-xs text-zinc-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                {post.is_hidden && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    <AlertCircle size={12} />
                    已隐藏
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {/* Title */}
                <div className="flex gap-3">
                  <span className="shrink-0 self-start rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-500">
                    标题
                  </span>
                  <h3 className="font-medium text-zinc-900">{post.title}</h3>
                </div>

                {/* Content */}
                <div className="flex gap-3">
                  <span className="shrink-0 self-start rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-500">
                    正文
                  </span>
                  <p className="text-sm text-zinc-600 line-clamp-3">{post.content}</p>
                </div>

                {/* Media */}
                {post.images && post.images.length > 0 && (
                  <div className="flex gap-3">
                    <span className="shrink-0 self-start rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-500">
                      图片
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {post.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={getFileUrl(img)}
                          className="h-20 w-20 rounded-lg object-cover bg-zinc-50 border border-zinc-100"
                          alt=""
                        />
                      ))}
                    </div>
                  </div>
                )}

                {post.videos && post.videos.length > 0 && (
                  <div className="flex gap-3">
                    <span className="shrink-0 self-start rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-500">
                      视频
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {post.videos.map((video, idx) => (
                        <video
                          key={idx}
                          src={getFileUrl(video)}
                          className="h-20 w-20 rounded-lg object-cover bg-zinc-50 border border-zinc-100"
                          controls
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-start gap-2 sm:flex-col">
              <button
                onClick={() => handleToggleHide(post)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  post.is_hidden
                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                }`}
              >
                {post.is_hidden ? (
                  <>
                    <CheckCircle size={16} />
                    <span>恢复显示</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={16} />
                    <span>隐藏帖子</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && !loading && (
          <div className="py-12 text-center text-zinc-500">暂无帖子内容</div>
        )}
      </div>
    </div>
  )
}

export default function MerchantCommunityPage() {
  const [activeTab, setActiveTab] = useState<'groups' | 'moderation'>('groups')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">社区管理</h1>
          <p className="mt-1 text-sm text-zinc-500">管理您的社群话题圈和监控内容质量。</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('groups')}
            className={`border-b-2 py-4 text-sm font-medium transition-colors ${
              activeTab === 'groups'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:items-zinc-700 hover:border-zinc-300'
            }`}
          >
            话题圈管理
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`border-b-2 py-4 text-sm font-medium transition-colors ${
              activeTab === 'moderation'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:items-zinc-700 hover:border-zinc-300'
            }`}
          >
            内容审核
          </button>
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'groups' ? <GroupManagement /> : <PostModeration />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
