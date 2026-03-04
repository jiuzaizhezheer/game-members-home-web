import { useEffect, useState, useCallback } from 'react'
import { Star, MessageSquareQuote, Loader2, User } from 'lucide-react'
import { reviewService } from '@/features/review/service'
import type { ReviewListOut, ReviewOut } from '@/features/review/types'
import { getFileUrl } from '@/shared/utils/file'

interface ReviewListProps {
  productId: string
}

export function ReviewList({ productId }: ReviewListProps) {
  const [data, setData] = useState<ReviewListOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 5

  const fetchReviews = useCallback(
    async (currentPage: number) => {
      try {
        setLoading(true)
        const res = await reviewService.getProductReviews(productId, currentPage, pageSize)
        setData(res)
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setLoading(false)
      }
    },
    [productId],
  )

  useEffect(() => {
    fetchReviews(page)
  }, [page, fetchReviews])

  if (loading && !data) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (!data || data.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-50/50 rounded-2xl border border-zinc-100">
        <div className="mb-4 rounded-full bg-white p-4 shadow-sm ring-1 ring-zinc-100">
          <MessageSquareQuote className="h-8 w-8 text-zinc-300" />
        </div>
        <p className="text-sm font-medium text-zinc-900">暂无评价</p>
        <p className="mt-1 text-sm text-zinc-500">该商品还没有收到任何评价</p>
      </div>
    )
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
    <div className="space-y-8">
      {/* List */}
      <div className="divide-y divide-zinc-100">
        {data.items.map((review: ReviewOut) => (
          <div key={review.id} className="py-8 first:pt-0 last:pb-0">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-100 ring-2 ring-white">
                {review.user.avatar ? (
                  <img
                    src={getFileUrl(review.user.avatar)}
                    alt={review.user.username}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-400">
                    <User size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-900">{review.user.username}</h4>
                    <div className="mt-1 flex items-center gap-3">
                      {renderStars(review.rating)}
                      <span className="text-xs text-zinc-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
                  {review.content}
                </div>

                {review.images && review.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {review.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="h-20 w-20 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer hover:border-indigo-300 transition-colors"
                      >
                        <img
                          src={getFileUrl(img)}
                          alt={`评价图片 ${idx + 1}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Merchant Reply */}
                {review.merchant_reply && (
                  <div className="mt-5 rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <span className="text-xs font-bold text-zinc-900">商家回复</span>
                      {review.reply_at && (
                        <span className="text-xs text-zinc-500">
                          {new Date(review.reply_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">
                      {review.merchant_reply}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8 border-t border-zinc-100">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <span className="text-sm text-zinc-500">
            第 {page} / {data.total_pages} 页
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
            disabled={page === data.total_pages || loading}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
