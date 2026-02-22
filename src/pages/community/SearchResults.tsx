import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Loader2, Search as SearchIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { communityApi } from '@/features/community/api'
import type { PostItemOut } from '@/features/community/types'
import PostCard from './components/PostCard'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const [posts, setPosts] = useState<PostItemOut[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const handleSearch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await communityApi.searchPosts(query, page, 20)
      setPosts(res.items)
      setTotal(res.total)
    } catch {
      console.error('Search failed')
    } finally {
      setLoading(false)
    }
  }, [page, query])

  useEffect(() => {
    if (query) {
      handleSearch()
    }
  }, [handleSearch, query])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl"
    >
      <div className="mb-8">
        <Link
          to="/community"
          className="mb-4 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" />
          返回社区首页
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          搜索结果: <span className="text-indigo-600">“{query}”</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">共找到 {total} 条相关的帖子</p>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50">
            <SearchIcon className="h-8 w-8 text-zinc-300" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">未找到相关讨论</h3>
          <p className="mt-1 text-sm text-zinc-500 text-pretty">
            尝试更换关键词，或者在下方搜索圈子。
          </p>
          <Link
            to="/community"
            className="mt-6 rounded-full bg-indigo-50 px-6 py-2 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-100"
          >
            返回浏览圈子
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} showGroup />
          ))}

          {/* Pagination */}
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
