import { Link } from 'react-router-dom'
import { Eye, Heart, MessageSquare } from 'lucide-react'
import type { PostItemOut } from '@/features/community/types'
import { getFileUrl } from '@/shared/utils/file'
import { motion } from 'framer-motion'

interface PostCardProps {
  post: PostItemOut
  showGroup?: boolean
}

export default function PostCard({ post, showGroup = false }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/community/posts/${post.id}`}
        className="group block rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50"
      >
        <div className="flex gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            {post.author_avatar ? (
              <img
                src={getFileUrl(post.author_avatar)}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm bg-zinc-100"
                alt={post.author_name}
                loading="lazy"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 font-bold ring-2 ring-white shadow-sm">
                {post.author_name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 py-0.5">
            {/* Meta */}
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2 text-zinc-500 scale-95 origin-left">
                <span className="font-bold text-zinc-900 text-sm whitespace-nowrap">
                  {post.author_name}
                </span>
                <span className="text-zinc-300">|</span>
                <span className="whitespace-nowrap">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                {showGroup && post.group_name && (
                  <>
                    <span className="text-zinc-300">·</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600">
                      {post.group_name}
                    </span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {post.is_top && (
                  <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                    置顶
                  </span>
                )}
                {post.is_mine && (
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                    我的
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-zinc-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {post.title}
            </h3>
            <p className="mt-1.5 text-sm text-zinc-500 line-clamp-2 leading-relaxed">
              {post.content}
            </p>

            {/* Images Preview (Max 3) */}
            {post.images && post.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 w-fit max-w-[360px]">
                {post.images.slice(0, 3).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 border border-zinc-100/50"
                  >
                    <img
                      src={getFileUrl(img)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt=""
                      loading="lazy"
                    />
                  </div>
                ))}
                {post.images.length > 3 && (
                  <div className="flex aspect-square items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-500">
                    +{post.images.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="mt-5 flex items-center gap-6 text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-1.5 hover:text-zinc-600 transition-colors">
                <Eye size={16} /> {post.view_count}
              </span>
              <span
                className={`flex items-center gap-1.5 transition-colors ${
                  post.is_liked ? 'text-rose-500' : 'hover:text-rose-500'
                }`}
              >
                <Heart size={16} fill={post.is_liked ? 'currentColor' : 'none'} /> {post.like_count}
              </span>
              <span className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                <MessageSquare size={16} /> {post.comment_count}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
