import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Loader2, MessageCircle, ChevronRight, Search, Zap } from 'lucide-react'
import { communityApi } from '@/features/community/api'
import type { GroupItemOut } from '@/features/community/types'
import { getFileUrl } from '@/shared/utils/file'

export default function GroupListPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<GroupItemOut[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    communityApi
      .getGroups(1, 100)
      .then((res) => setGroups(res.items))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredGroups = groups.filter((group) => {
    const query = searchQuery.toLowerCase()
    return (
      group.name.toLowerCase().includes(query) ||
      (group.description || '').toLowerCase().includes(query)
    )
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl"
    >
      {/* Header & Search */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">探索话题圈</h1>
          <p className="mt-2 text-zinc-500">发现感兴趣的游戏社区，与志同道合的玩家交流心得。</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Enter 搜索帖子"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/community/search?q=${encodeURIComponent(searchQuery.trim())}`)
              }
            }}
            className="w-full rounded-full border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50">
            <Search className="h-8 w-8 text-zinc-300" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">没有找到相关圈子</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {searchQuery ? '换个关键词试试看？' : '暂时还没有任何话题圈由于还没有人创建。'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              清除搜索
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <Link
              key={group.id}
              to={`/community/groups/${group.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1"
            >
              {/* Cover Image */}
              <div className="aspect-[2/1] w-full bg-zinc-100 relative overflow-hidden">
                {group.cover_image ? (
                  <img
                    src={getFileUrl(group.cover_image)}
                    alt={group.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
                    <Zap className="h-10 w-10 text-zinc-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white shadow-sm line-clamp-1">
                    {group.name}
                  </h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="mb-6 text-sm text-zinc-500 line-clamp-2 min-h-[40px]">
                  {group.description || '这个圈子很神秘，还没有介绍...'}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-50">
                  <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-zinc-400" />
                      {group.member_count}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle size={14} className="text-zinc-400" />
                      {group.post_count}
                    </span>
                  </div>

                  {group.is_joined ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                      已加入
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 opacity-0 transition-opacity transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                      进入圈子 <ChevronRight size={14} />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}
