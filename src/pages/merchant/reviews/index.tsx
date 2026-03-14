import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Star, Loader2, User, ShoppingBag, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { reviewService } from '@/features/review/service'
import type { ReviewListOut, ReviewOut } from '@/features/review/types'
import { getFileUrl } from '@/shared/utils/file'

export default function MerchantReviewPage() {
  const [data, setData] = useState<ReviewListOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Reply state
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  const fetchReviews = useCallback(async (currentPage: number) => {
    try {
      setLoading(true)
      const res = await reviewService.getMerchantReviews(currentPage, pageSize)
      setData(res)
    } catch (error) {
      console.error('Failed to fetch merchant reviews:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews(page)
  }, [page, fetchReviews])

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyContent.trim()) {
      toast.error('请输入回复内容')
      return
    }

    setSubmittingReply(true)
    try {
      await reviewService.replyReview(reviewId, { merchant_reply: replyContent })
      setReplyingId(null)
      setReplyContent('')
      // Refresh list to show reply
      fetchReviews(page)
    } catch (error) {
      console.error('Failed to reply to review:', error)
    } finally {
      setSubmittingReply(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= rating ? '#f59e0b' : 'transparent'}
            className={star <= rating ? 'text-amber-500' : 'text-zinc-200'}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
            评价管理
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            查看和回复买家对您的商品留下的评价。良好的评价互动有助于提升销量。
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        {loading && !data ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : !data || data.total === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-50/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100">
              <MessageSquare className="h-8 w-8 text-zinc-300" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-900">暂无评价记录</h3>
            <p className="mt-1 text-sm text-zinc-500 max-w-sm">
              您的商品尚未收到任何买家评价。持续提供优质商品和服务，评价自然会来。
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            <AnimatePresence>
              {data.items.map((review: ReviewOut) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6 transition-colors hover:bg-zinc-50/50"
                >
                  <div className="flex gap-5">
                    {/* User Info col */}
                    <div className="flex w-48 shrink-0 flex-col items-center gap-2 border-r border-zinc-100 pr-5">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-zinc-100 ring-2 ring-white shadow-sm">
                        {review.user.avatar ? (
                          <img
                            src={getFileUrl(review.user.avatar)}
                            alt={review.user.username}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-400">
                            <User size={24} />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-zinc-900 truncate w-full max-w-[120px]">
                          {review.user.username}
                        </p>
                        <p className="text-xs text-zinc-500">买家</p>
                      </div>
                    </div>

                    {/* Review Content col */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {renderStars(review.rating)}
                          {review.rating >= 4 ? (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                              好评
                            </span>
                          ) : review.rating === 3 ? (
                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                              中评
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1">
                              差评
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-400">
                          {new Date(review.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                          {review.content}
                        </p>
                      </div>

                      {/* Display Images if any */}
                      {review.images && review.images.length > 0 && (
                        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                          {review.images.map((img, idx) => (
                            <a
                              key={idx}
                              href={getFileUrl(img)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block shrink-0 h-20 w-20 rounded-lg overflow-hidden border border-zinc-200"
                            >
                              <img
                                src={getFileUrl(img)}
                                alt={`评价图 ${idx + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Product Reference */}
                      <Link
                        to={`/merchant/product/edit/${review.product_id}`}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-100/80 px-3 py-1.5 cursor-pointer hover:bg-zinc-200/80 transition-colors"
                      >
                        <ShoppingBag size={14} className="text-zinc-500" />
                        <span className="text-xs font-medium text-zinc-700">相关商品</span>
                        <ChevronRight size={14} className="text-zinc-400" />
                      </Link>

                      {/* Merchant Reply Section */}
                      <div className="mt-5">
                        {review.merchant_reply ? (
                          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                <span className="text-xs font-bold text-indigo-900">商家回复</span>
                              </div>
                              <span className="text-xs text-indigo-400">
                                {review.reply_at && new Date(review.reply_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-indigo-800 loading-relaxed whitespace-pre-wrap">
                              {review.merchant_reply}
                            </p>
                          </div>
                        ) : (
                          <div>
                            {replyingId === review.id ? (
                              <div className="flex flex-col gap-3 items-end">
                                <textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="请输入回复内容，回复后即公开可见且不可修改..."
                                  className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                                  rows={3}
                                  maxLength={500}
                                />
                                <div className="flex items-center gap-3 w-full justify-between">
                                  <span className="text-xs text-zinc-400">
                                    {replyContent.length}/500 字，回复仅限一次。
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setReplyingId(null)
                                        setReplyContent('')
                                      }}
                                      className="rounded-full px-4 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                                    >
                                      取消
                                    </button>
                                    <button
                                      onClick={() => handleReplySubmit(review.id)}
                                      disabled={submittingReply || !replyContent.trim()}
                                      className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                      {submittingReply && (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      )}
                                      发送回复
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setReplyingId(review.id)
                                  setReplyContent('')
                                }}
                                className="inline-flex rounded-full bg-white px-4 py-1.5 text-xs font-medium text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50 hover:ring-indigo-300 transition-all"
                              >
                                快速回复
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-4">
            <span className="text-sm text-zinc-500">
              共 <span className="font-medium text-zinc-900">{data.total}</span> 条评价
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              <span className="text-sm text-zinc-600 px-2">
                {page} / {data.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages || loading}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
