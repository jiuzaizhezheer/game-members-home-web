import { useRef, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Users,
  Loader2,
  Eye,
  Heart,
  MessageSquare,
  Flag,
  X,
  Reply,
  Send,
  Pencil,
  Share2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { communityApi } from '@/features/community/api'
import type { PostDetailOut, CommentItemOut } from '@/features/community/types'
import type { ReportTargetType } from '@/features/report/types'
import { getFileUrl } from '@/shared/utils/file'
import ReportModal from '@/components/common/ReportModal'
import ImageViewer from '@/components/ui/ImageViewer'
import { useAuth } from '@/contexts/AuthContext'

type CommentTreeNode = CommentItemOut & { children: CommentTreeNode[] }

// Helper Component for Comment Tree
const CommentNode = ({
  comment,
  isChild = false,
  onLike,
  onReply,
  onReport,
}: {
  comment: CommentTreeNode
  isChild?: boolean
  onLike: (id: string) => void
  onReply: (comment: CommentItemOut) => void
  onReport: (comment: CommentItemOut) => void
}) => {
  const [expanded, setExpanded] = useState(false)
  const hasMoreBefore = comment.children.length > 1
  const visibleChildren = expanded ? comment.children : comment.children.slice(0, 1)

  return (
    <div className={`group flex gap-3 ${isChild ? 'mt-3 first:mt-0' : ''}`}>
      {/* Avatar */}
      <div className="shrink-0">
        {isChild ? (
          comment.author_avatar ? (
            <img
              src={getFileUrl(comment.author_avatar)}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 font-bold text-[10px]">
              {comment.author_name?.[0]}
            </div>
          )
        ) : comment.author_avatar ? (
          <img
            src={getFileUrl(comment.author_avatar)}
            className="h-10 w-10 rounded-full object-cover shadow-sm border border-white"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 font-bold text-sm">
            {comment.author_name?.[0]}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-bold text-zinc-900 ${isChild ? 'text-xs' : 'text-sm'}`}>
            {comment.author_name}
          </span>
          {comment.reply_to_username && (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <span className="i-lucide-play w-2 h-2 fill-zinc-300 text-zinc-300" />
              回复 <span className="text-indigo-600 font-medium">@{comment.reply_to_username}</span>
            </span>
          )}
          {!isChild && (
            <span className="text-xs text-zinc-400 ml-auto" suppressHydrationWarning>
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Content */}
        <p className={`text-zinc-700 leading-relaxed ${isChild ? 'text-xs' : 'text-sm'}`}>
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2 mb-1">
          {isChild && (
            <span className="text-xs text-zinc-400" suppressHydrationWarning>
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          )}
          <button
            onClick={() => onLike(comment.id)}
            className={`flex items-center gap-1 text-xs hover:text-rose-500 transition-colors ${comment.is_liked ? 'text-rose-500' : 'text-zinc-400'}`}
          >
            <Heart size={12} fill={comment.is_liked ? 'currentColor' : 'none'} />{' '}
            {comment.like_count || '赞'}
          </button>
          <button
            onClick={() => onReply(comment)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-indigo-600 transition-colors"
          >
            <Reply size={12} /> 回复
          </button>
          <button
            onClick={() => onReport(comment)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-rose-600 transition-colors"
          >
            <Flag size={12} /> 举报
          </button>
        </div>

        {/* Nested Children */}
        {comment.children.length > 0 && (
          <div className="mt-3 bg-zinc-50/80 rounded-xl p-3 border border-zinc-100/50">
            <div className="space-y-3">
              {visibleChildren.map((child) => (
                <CommentNode
                  key={child.id}
                  comment={child}
                  isChild={true}
                  onLike={onLike}
                  onReply={onReply}
                  onReport={onReport}
                />
              ))}
            </div>
            {hasMoreBefore && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                {expanded ? '收起回复' : `展开 ${comment.children.length - 1} 条回复`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { state } = useAuth()
  const [post, setPost] = useState<PostDetailOut | null>(null)
  const [comments, setComments] = useState<CommentItemOut[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<CommentItemOut | null>(null)
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [reportTarget, setReportTarget] = useState<{
    type: ReportTargetType
    id: string
  } | null>(null)

  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  const fetchedId = useRef<string | null>(null)

  useEffect(() => {
    if (!id) return

    // Prevent double fetch in React Strict Mode (Dev)
    if (fetchedId.current === id) return
    fetchedId.current = id

    setLoading(true)
    Promise.all([communityApi.getPostDetail(id), communityApi.getPostComments(id, 1, 50)])
      .then(([postRes, commentsRes]) => {
        setPost(postRes)
        setComments(commentsRes.items)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  // Toggle Like Post
  const handleLike = async () => {
    if (!post) return
    try {
      // Optimistic update
      const newStatus = !post.is_liked
      const countDelta = newStatus ? 1 : -1
      setPost((prev) =>
        prev ? { ...prev, is_liked: newStatus, like_count: prev.like_count + countDelta } : null,
      )

      await communityApi.toggleLike(post.id, 'post')
    } catch {
      // Revert if failed
      setPost((prev) =>
        prev
          ? {
              ...prev,
              is_liked: !prev.is_liked,
              like_count: prev.like_count + (prev.is_liked ? 1 : -1),
            }
          : null,
      )
    }
  }

  // Toggle Like Comment
  const handleLikeComment = async (commentId: string) => {
    try {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              is_liked: !c.is_liked,
              like_count: c.like_count + (c.is_liked ? -1 : 1),
            }
          }
          return c
        }),
      )
      await communityApi.toggleLike(commentId, 'comment')
    } catch (error) {
      console.error(error)
    }
  }

  const handleReply = (comment: CommentItemOut) => {
    setReplyingTo(comment)
    commentInputRef.current?.focus()
  }

  const handleReportComment = (comment: CommentItemOut) => {
    if (!state.isAuthenticated) {
      return
    }
    setReportTarget({ type: 'comment', id: comment.id })
  }

  const handleSubmitComment = async () => {
    if (!commentContent.trim() || !post) return

    setSubmitting(true)
    try {
      await communityApi.createComment(post.id, {
        content: commentContent,
        parent_id: replyingTo?.id,
      })
      setCommentContent('')
      setReplyingTo(null)

      // Refresh comments to get correct data (including reply_to_username)
      communityApi.getPostComments(post.id).then((res) => setComments(res.items))

      // Update post comment count
      setPost((prev) => (prev ? { ...prev, comment_count: prev.comment_count + 1 } : null))
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('链接已复制到剪贴板')
  }

  if (loading && !post)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-indigo-500" />
      </div>
    )
  if (!post) return <div className="text-center p-12 text-zinc-500">帖子不存在</div>

  return (
    <div className="mx-auto max-w-3xl pb-24">
      {/* Post Content */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
      >
        {/* Breadcrumb / Group Link */}
        <Link
          to={`/community/groups/${post.group_id}`}
          className="mb-4 inline-flex items-center gap-1 rounded-full bg-zinc-50 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-zinc-100 transition-colors"
        >
          <Users size={12} /> {post.group_name}
        </Link>

        {/* Author Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {post.author_avatar ? (
              <img
                src={getFileUrl(post.author_avatar)}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold">
                {post.author_name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-zinc-900">{post.author_name}</h3>
              <p className="text-xs text-zinc-500" suppressHydrationWarning>
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          {/* Options (Report, Share, Edit, etc.) */}
          <div className="flex items-center gap-2">
            {state.user?.id === post.author_id && (
              <Link
                to={`/community/posts/${post.id}/edit`}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-50 hover:text-indigo-600 transition-colors"
                title="编辑帖子"
              >
                <Pencil size={18} />
              </Link>
            )}
            {state.isAuthenticated && (
              <button
                onClick={() => setReportTarget({ type: 'post', id: post.id })}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-50 hover:text-rose-600 transition-colors"
                title="举报"
              >
                <Flag size={18} />
              </button>
            )}
            <button
              onClick={handleShare}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-50 hover:text-indigo-600 transition-colors"
              title="分享链接"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Title & Body */}
        <h1 className="mb-4 text-xl font-bold text-zinc-900 leading-tight">{post.title}</h1>
        <div className="prose prose-zinc max-w-none text-zinc-700 text-sm whitespace-pre-wrap leading-relaxed">
          {post.content}
        </div>

        {/* Images */}
        {post.images?.length > 0 && (
          <div
            className={`mt-6 grid gap-2 ${
              post.images.length === 1
                ? 'grid-cols-1 max-w-sm'
                : post.images.length === 2
                  ? 'grid-cols-2'
                  : post.images.length <= 4
                    ? 'grid-cols-2 sm:grid-cols-3'
                    : 'grid-cols-3'
            }`}
          >
            {post.images.map((img, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-lg bg-zinc-100 ${
                  post.images.length === 1 ? 'aspect-auto' : 'aspect-square'
                }`}
              >
                <img
                  src={getFileUrl(img)}
                  className={`h-full w-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300 ${post.images.length === 1 ? 'max-h-96 w-auto' : ''}`}
                  loading="lazy"
                  onClick={() => {
                    setViewerIndex(idx)
                    setViewerOpen(true)
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Videos */}
        {post.videos && post.videos.length > 0 && (
          <div className="mt-6">
            {post.videos.map((video, idx) => (
              <video
                key={idx}
                src={getFileUrl(video)}
                controls
                className="w-full rounded-lg bg-black aspect-video"
              />
            ))}
          </div>
        )}

        {/* Stats Bar */}
        <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-4 text-sm text-zinc-500">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Eye size={16} /> {post.view_count}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare size={16} /> {post.comment_count}
            </span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
            >
              <Share2 size={16} /> 分享
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              post.is_liked ? 'text-rose-500' : 'hover:text-zinc-900'
            }`}
          >
            <Heart size={18} fill={post.is_liked ? 'currentColor' : 'none'} />
            {post.like_count > 0 ? post.like_count : '点赞'}
          </motion.button>
        </div>
      </motion.article>

      {/* Comment Section */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-bold text-zinc-900 flex items-center gap-2">
          全部评论 <span className="text-sm font-normal text-zinc-500">({post.comment_count})</span>
        </h3>

        <div className="space-y-6">
          {(() => {
            // 1. Build Tree
            const commentMap = new Map<string, CommentTreeNode>()
            const roots: CommentTreeNode[] = []

            // Initialize map
            comments.forEach((c) => {
              commentMap.set(c.id, { ...c, children: [] })
            })

            // Link parent-child
            comments.forEach((c) => {
              const node = commentMap.get(c.id)!
              if (c.parent_id && commentMap.has(c.parent_id)) {
                const parent = commentMap.get(c.parent_id)!
                parent.children.push(node)
              } else {
                roots.push(node)
              }
            })

            // 2. Render
            if (roots.length === 0 && comments.length === 0) {
              return (
                <div className="py-8 text-center text-sm text-zinc-400">暂无评论，快来抢沙发~</div>
              )
            }

            return roots.map((root) => (
              <div key={root.id} className="border-b border-zinc-50 last:border-0 pb-6 last:pb-0">
                <CommentNode
                  comment={root}
                  onLike={handleLikeComment}
                  onReply={handleReply}
                  onReport={handleReportComment}
                />
              </div>
            ))
          })()}
        </div>
      </div>

      {/* Fixed Bottom Input */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white/80 backdrop-blur-md px-4 py-3 z-50">
        <div className="mx-auto max-w-3xl flex items-end gap-3">
          <div className="flex-1 relative">
            {replyingTo && (
              <div className="absolute -top-10 left-0 right-0 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-500 flex items-center justify-between shadow-sm animate-in slide-in-from-bottom-2">
                <span>
                  回复 <span className="font-bold text-indigo-600">@{replyingTo.author_name}</span>:
                </span>
                <button onClick={() => setReplyingTo(null)}>
                  <X size={14} />
                </button>
              </div>
            )}
            <textarea
              ref={commentInputRef}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none max-h-32"
              rows={1}
              placeholder={replyingTo ? `回复 ${replyingTo.author_name}...` : '说点什么...'}
              style={{ minHeight: '44px' }}
            />
          </div>
          <button
            onClick={handleSubmitComment}
            disabled={!commentContent.trim() || submitting}
            className="shrink-0 rounded-full bg-indigo-600 p-2.5 text-white shadow-lg shadow-indigo-200 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} className="ml-0.5" />
            )}
          </button>
        </div>
      </div>
      <ReportModal
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        targetType={reportTarget?.type ?? 'post'}
        targetId={reportTarget?.id ?? ''}
      />
      {/* Image Viewer */}
      <ImageViewer
        images={post.images}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  )
}
