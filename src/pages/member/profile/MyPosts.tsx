import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Loader2, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { communityApi } from '@/features/community/api'
import type { PostItemOut } from '@/features/community/types'
import PostCard from '@/pages/community/components/PostCard'

export default function MyPostsPage() {
  const [posts, setPosts] = useState<PostItemOut[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchMyPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await communityApi.getMyPosts(page, 20)
      setPosts(res.items)
      setTotal(res.total)
    } catch (error) {
      console.error('Failed to fetch my posts', error)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchMyPosts()
  }, [fetchMyPosts])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/member/profile"
            className="mb-2 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            返回个人中心
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">我的发布</h1>
          <p className="mt-1 text-sm text-zinc-500">管理您在各话题圈发布的帖子和讨论</p>
        </div>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50">
            <MessageSquare className="h-8 w-8 text-zinc-300" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">还没有发布过帖子</h3>
          <p className="mt-1 text-sm text-zinc-500 text-pretty">
            去各个圈子看看大家在聊什么吧，开启您的第一篇讨论。
          </p>
          <Link
            to="/community"
            className="mt-6 rounded-full bg-indigo-50 px-6 py-2 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-100"
          >
            去社区探索
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} showGroup />
          ))}

          {/* Pagination Simple */}
          {total > 20 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:opacity-50"
              >
                上一页
              </button>
              <span className="text-sm text-zinc-500">
                第 {page} 页 / 共 {Math.ceil(total / 20)} 页
              </span>
              <button
                disabled={page * 20 >= total}
                onClick={() => setPage(page + 1)}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
