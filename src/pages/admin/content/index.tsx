import { useState, useEffect, useCallback } from 'react'
import {
  MessageCircle,
  FileSearch,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  MessageSquareOff,
  CheckSquare,
  Square,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/features/admin/api'
import type { AdminPostItem, AdminCommentItem } from '@/features/admin/types'
import { useDebounce } from '@/hooks/useDebounce'
import { useConfirm } from '@/components/ui/confirmContext'

type ContentTab = 'posts' | 'comments'

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>('posts')
  const confirm = useConfirm()

  // Posts state
  const [posts, setPosts] = useState<AdminPostItem[]>([])
  const [postsTotal, setPostsTotal] = useState(0)
  const [postsLoading, setPostsLoading] = useState(false)
  const [postsPage, setPostsPage] = useState(1)
  const [postKeyword, setPostKeyword] = useState('')
  const [postHiddenFilter, setPostHiddenFilter] = useState<string>('')
  const debouncedPostKeyword = useDebounce(postKeyword, 600)

  // Batch selection state (only for posts)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchLoading, setBatchLoading] = useState(false)

  // Comments state
  const [comments, setComments] = useState<AdminCommentItem[]>([])
  const [commentsTotal, setCommentsTotal] = useState(0)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsPage, setCommentsPage] = useState(1)
  const postsPageSize = 15
  const commentsPageSize = 20

  const fetchPosts = useCallback(async () => {
    try {
      setPostsLoading(true)
      setSelectedIds(new Set())
      const res = await adminApi.getPosts({
        page: postsPage,
        page_size: postsPageSize,
        keyword: debouncedPostKeyword || undefined,
        is_hidden: postHiddenFilter === '' ? undefined : postHiddenFilter === 'true',
      })
      setPosts(res.items)
      setPostsTotal(res.total)
    } catch {
      toast.error('获取帖子列表失败')
    } finally {
      setPostsLoading(false)
    }
  }, [postsPage, debouncedPostKeyword, postHiddenFilter])

  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true)
      const res = await adminApi.getComments({ page: commentsPage, page_size: commentsPageSize })
      setComments(res.items)
      setCommentsTotal(res.total)
    } catch {
      toast.error('获取评论列表失败')
    } finally {
      setCommentsLoading(false)
    }
  }, [commentsPage])

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts()
  }, [activeTab, fetchPosts])
  useEffect(() => {
    if (activeTab === 'comments') fetchComments()
  }, [activeTab, fetchComments])

  const handleReviewPost = async (post: AdminPostItem) => {
    const newHidden = !post.is_hidden
    try {
      await adminApi.reviewPost(post.id, newHidden)
      toast.success(newHidden ? '帖子已隐藏' : '帖子已显示')
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_hidden: newHidden } : p)))
    } catch {
      toast.error('审核操作失败')
    }
  }

  const handleDeletePost = async (post: AdminPostItem) => {
    if (
      !(await confirm({
        title: '删除帖子',
        description: `确定要删除帖子 "${post.title}" 吗？此操作不可恢复。`,
        confirmText: '删除',
        cancelText: '取消',
        variant: 'danger',
      }))
    )
      return
    try {
      await adminApi.deletePost(post.id)
      toast.success('帖子已删除')
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
      setPostsTotal((t) => t - 1)
    } catch {
      toast.error('删除失败')
    }
  }

  const handleDeleteComment = async (comment: AdminCommentItem) => {
    if (
      !(await confirm({
        title: '删除评论',
        description: '确定要删除该评论吗？此操作不可恢复。',
        confirmText: '删除',
        cancelText: '取消',
        variant: 'danger',
      }))
    )
      return
    try {
      await adminApi.deleteComment(comment.id)
      toast.success('评论已删除')
      setComments((prev) => prev.filter((c) => c.id !== comment.id))
      setCommentsTotal((t) => t - 1)
    } catch {
      toast.error('删除失败')
    }
  }

  // Batch operations
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === posts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(posts.map((p) => p.id)))
    }
  }

  const handleBatchHide = async () => {
    if (selectedIds.size === 0) return
    if (
      !(await confirm({
        title: `批量隐藏 ${selectedIds.size} 篇帖子`,
        description: '确定要隐藏所有选中的帖子吗？',
        confirmText: '批量隐藏',
        cancelText: '取消',
        variant: 'danger',
      }))
    )
      return
    setBatchLoading(true)
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map((id) => adminApi.reviewPost(id, true)))
      toast.success(`已隐藏 ${ids.length} 篇帖子`)
      setPosts((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, is_hidden: true } : p)))
      setSelectedIds(new Set())
    } catch {
      toast.error('批量操作部分失败')
    } finally {
      setBatchLoading(false)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    if (
      !(await confirm({
        title: `批量删除 ${selectedIds.size} 篇帖子`,
        description: '确定要删除所有选中的帖子吗？此操作不可恢复！',
        confirmText: '批量删除',
        cancelText: '取消',
        variant: 'danger',
      }))
    )
      return
    setBatchLoading(true)
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map((id) => adminApi.deletePost(id)))
      toast.success(`已删除 ${ids.length} 篇帖子`)
      setPosts((prev) => prev.filter((p) => !selectedIds.has(p.id)))
      setPostsTotal((t) => t - ids.length)
      setSelectedIds(new Set())
    } catch {
      toast.error('批量操作部分失败')
    } finally {
      setBatchLoading(false)
    }
  }

  const allSelected = posts.length > 0 && selectedIds.size === posts.length
  const hasSelection = selectedIds.size > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">内容审核</h1>
          <p className="mt-1 text-sm text-zinc-500">管理全平台帖子与评论</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
          <FileSearch size={20} className="text-purple-500" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-2xl bg-zinc-100 p-1 w-fit">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition-all ${activeTab === 'posts' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <MessageCircle size={14} />
          帖子管理
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition-all ${activeTab === 'comments' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <MessageSquareOff size={14} />
          评论管理
        </button>
      </div>

      {/* Posts Panel */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {/* Post Filters */}
          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="搜索帖子标题/内容..."
                value={postKeyword}
                onChange={(e) => {
                  setPostKeyword(e.target.value)
                  setPostsPage(1)
                }}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            <select
              value={postHiddenFilter}
              onChange={(e) => {
                setPostHiddenFilter(e.target.value)
                setPostsPage(1)
              }}
              className="h-10 appearance-none rounded-xl border border-zinc-200 bg-white pl-4 pr-4 text-sm font-medium text-zinc-700 outline-none transition-all focus:border-indigo-500 hover:border-zinc-300"
            >
              <option value="">全部帖子</option>
              <option value="false">正常显示</option>
              <option value="true">已隐藏</option>
            </select>
          </div>

          {/* Batch Action Bar */}
          <AnimatePresence>
            {hasSelection && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5"
              >
                <span className="text-sm font-medium text-indigo-700">
                  已选 {selectedIds.size} 篇
                </span>
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={handleBatchHide}
                    disabled={batchLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-900 disabled:opacity-50"
                  >
                    <EyeOff size={13} />
                    批量隐藏
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    disabled={batchLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    批量删除
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posts Table */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-zinc-50/80 text-zinc-500">
                  <tr>
                    <th className="pl-4 py-4 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="flex h-5 w-5 items-center justify-center text-zinc-400 hover:text-indigo-500"
                      >
                        {allSelected ? (
                          <CheckSquare size={16} className="text-indigo-500" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-4 font-medium">标题</th>
                    <th className="px-4 py-4 font-medium">作者</th>
                    <th className="px-4 py-4 font-medium">所属圈子</th>
                    <th className="px-4 py-4 font-medium">评论</th>
                    <th className="px-4 py-4 font-medium">状态</th>
                    <th className="px-4 py-4 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {postsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-zinc-400">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span>加载中...</span>
                        </div>
                      </td>
                    </tr>
                  ) : posts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-zinc-400">
                        暂无帖子数据
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <motion.tr
                        key={post.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`group transition-colors hover:bg-zinc-50/70 ${selectedIds.has(post.id) ? 'bg-indigo-50/50' : ''}`}
                      >
                        <td className="pl-4 py-4 w-10">
                          <button
                            onClick={() => toggleSelect(post.id)}
                            className="flex h-5 w-5 items-center justify-center text-zinc-300 hover:text-indigo-500"
                          >
                            {selectedIds.has(post.id) ? (
                              <CheckSquare size={16} className="text-indigo-500" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <p className="line-clamp-1 font-medium text-zinc-900">{post.title}</p>
                          <p className="line-clamp-1 text-xs text-zinc-400 mt-0.5">
                            {post.content}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-zinc-500">{post.author_name}</td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                            {post.group_name}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-zinc-500">{post.comment_count}</td>
                        <td className="px-4 py-4">
                          {post.is_hidden ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 ring-1 ring-inset ring-zinc-500/20">
                              <EyeOff size={10} />
                              已隐藏
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                              <Eye size={10} />
                              正常
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleReviewPost(post)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-indigo-500"
                              title={post.is_hidden ? '取消隐藏' : '隐藏帖子'}
                            >
                              {post.is_hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                            <button
                              onClick={() => handleDeletePost(post)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                              title="删除帖子"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {postsTotal > 0 && (
              <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-6 py-4">
                <div className="text-sm text-zinc-500">
                  第 {postsPage} / {Math.ceil(postsTotal / postsPageSize)} 页，共 {postsTotal} 篇
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={postsPage === 1}
                    onClick={() => setPostsPage((p) => p - 1)}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <button
                    disabled={postsPage * postsPageSize >= postsTotal}
                    onClick={() => setPostsPage((p) => p + 1)}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments Panel */}
      {activeTab === 'comments' && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-zinc-50/80 text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium">评论内容</th>
                  <th className="px-6 py-4 font-medium">评论者</th>
                  <th className="px-6 py-4 font-medium">发布时间</th>
                  <th className="px-6 py-4 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {commentsLoading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-zinc-400">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>加载中...</span>
                      </div>
                    </td>
                  </tr>
                ) : comments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-zinc-400">
                      暂无评论数据
                    </td>
                  </tr>
                ) : (
                  comments.map((comment) => (
                    <motion.tr
                      key={comment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group transition-colors hover:bg-zinc-50/70"
                    >
                      <td className="px-6 py-4">
                        <p className="line-clamp-2 text-zinc-700">{comment.content}</p>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">{comment.author_name}</td>
                      <td className="px-6 py-4 text-zinc-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteComment(comment)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500 ml-auto"
                          title="删除评论"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {commentsTotal > 0 && (
            <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-6 py-4">
              <div className="text-sm text-zinc-500">
                第 {commentsPage} / {Math.ceil(commentsTotal / commentsPageSize)} 页，共{' '}
                {commentsTotal} 条
              </div>
              <div className="flex gap-2">
                <button
                  disabled={commentsPage === 1}
                  onClick={() => setCommentsPage((p) => p - 1)}
                  className="rounded-lg border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  disabled={commentsPage * commentsPageSize >= commentsTotal}
                  onClick={() => setCommentsPage((p) => p + 1)}
                  className="rounded-lg border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
