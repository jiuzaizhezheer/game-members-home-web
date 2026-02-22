import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Users, Loader2, Plus, MessageSquare, FileText, ChevronLeft, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { communityApi } from '@/features/community/api'
import type { GroupDetailOut, PostItemOut } from '@/features/community/types'
import { getFileUrl } from '@/shared/utils/file'
import { useConfirm } from '@/components/ui/confirmContext'
import PostCard from '../components/PostCard'

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [group, setGroup] = useState<GroupDetailOut | null>(null)
  const [posts, setPosts] = useState<PostItemOut[]>([])
  const [loading, setLoading] = useState(true)
  const confirm = useConfirm()

  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1

  useEffect(() => {
    if (!id) return
    Promise.all([communityApi.getGroupDetail(id), communityApi.getGroupPosts(id, page, 50)])
      .then(([groupRes, postsRes]) => {
        setGroup(groupRes)
        setPosts(postsRes.items)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id, page])

  const handleJoin = async () => {
    if (!group) return
    try {
      if (group.is_joined) {
        if (await confirm({ title: '退出圈子', description: '确定要退出该圈子吗？' })) {
          await communityApi.leaveGroup(group.id)
          toast.success('已退出')
          setGroup((prev) =>
            prev ? { ...prev, is_joined: false, member_count: prev.member_count - 1 } : null,
          )
        }
      } else {
        await communityApi.joinGroup(group.id)
        toast.success('加入成功')
        setGroup((prev) =>
          prev ? { ...prev, is_joined: true, member_count: prev.member_count + 1 } : null,
        )
      }
    } catch {
      toast.error('操作失败')
    }
  }

  if (loading && !group)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-indigo-500 h-8 w-8" />
      </div>
    )
  if (!group)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-full bg-zinc-100 p-4 mb-4">
          <Zap className="h-8 w-8 text-zinc-400" />
        </div>
        <p className="text-zinc-500">找不到这个圈子</p>
        <Link to="/community" className="mt-4 text-sm font-medium text-indigo-600 hover:underline">
          返回社区首页
        </Link>
      </div>
    )

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500">
      <Link
        to="/community"
        className="mb-4 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" />
        返回社区
      </Link>

      {/* Header Card */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-900/5">
        <div className="aspect-[3.5/1] w-full bg-zinc-100 relative">
          {group.cover_image ? (
            <>
              <img
                src={getFileUrl(group.cover_image)}
                className="absolute inset-0 h-full w-full object-cover blur-xl opacity-50 scale-110"
                aria-hidden="true"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
              <img
                src={getFileUrl(group.cover_image)}
                className="relative h-full w-full object-cover"
                alt={group.name}
                loading="lazy"
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-blue-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-white">
              <h1 className="text-4xl font-bold tracking-tight text-white shadow-sm">
                {group.name}
              </h1>
              {group.description && (
                <p className="mt-2 text-base text-zinc-100 max-w-2xl line-clamp-2 text-shadow-sm">
                  {group.description}
                </p>
              )}

              <div className="mt-4 flex items-center gap-6 text-sm font-medium text-zinc-200">
                <span className="flex items-center gap-1.5">
                  <Users size={16} /> {group.member_count} 成员
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText size={16} /> {group.post_count} 帖子
                </span>
              </div>
            </div>

            <button
              onClick={handleJoin}
              className={`shrink-0 rounded-full px-6 py-2.5 text-sm font-bold transition-all active:scale-95 shadow-lg ${
                group.is_joined
                  ? 'bg-white/20 text-white backdrop-blur-md hover:bg-white/30 ring-1 ring-white/50'
                  : 'bg-white text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {group.is_joined ? '已加入' : '加入圈子'}
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-zinc-900">最新讨论</h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-500">
            {posts.length}
          </span>
        </div>
        {group.is_joined && (
          <Link
            to={`/community/posts/create?group_id=${group.id}`}
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">发布新帖</span>
            <span className="sm:hidden">发帖</span>
          </Link>
        )}
      </div>

      {/* Post List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-zinc-200 border-dashed">
            <div className="p-4 bg-zinc-50 rounded-full mb-3">
              <MessageSquare className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-900">暂无讨论</p>
            <p className="text-xs text-zinc-500 mt-1">成为第一个发言的人吧！</p>
          </div>
        )}
      </div>
    </div>
  )
}
