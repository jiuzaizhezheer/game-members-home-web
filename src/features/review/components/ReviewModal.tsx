import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { reviewService } from '@/features/review/service'
import type { ReviewCreateIn } from '@/features/review/types'
import { getFileUrl } from '@/shared/utils/file'

const reviewSchema = z.object({
  rating: z.number().min(1, '请选择评分').max(5),
  content: z.string().min(5, '评价内容至少5个字符').max(1000, '评价内容最多1000个字符'),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  orderId: string
  productId: string
  productName: string
  productImage?: string | null
}

export function ReviewModal({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  productId,
  productName,
  productImage,
}: ReviewModalProps) {
  const [hoveredStar, setHoveredStar] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      content: '',
    },
  })

  // Close hook logic
  const handleClose = () => {
    reset()
    onClose()
  }

  const currentRating = watch('rating')

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      const payload: ReviewCreateIn = {
        order_id: orderId,
        product_id: productId,
        rating: data.rating,
        content: data.content,
        images: [], // Images upload is not implemented in this version
      }

      await reviewService.createReview(payload)
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Failed to submit review:', error)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="relative border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
                <h3 className="text-lg font-semibold text-zinc-900">发表评价</h3>
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="mb-6 flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white border border-zinc-200">
                    {productImage ? (
                      <img
                        src={getFileUrl(productImage)}
                        alt={productName}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full bg-zinc-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-medium text-zinc-900 line-clamp-2 leading-tight">
                      {productName}
                    </h4>
                  </div>
                </div>

                <form id="review-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Rating Component */}
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm font-medium text-zinc-700">请为商品打分</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setValue('rating', star, { shouldValidate: true })}
                          className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                        >
                          <Star
                            size={32}
                            fill={
                              star <= (hoveredStar || currentRating) ? '#f59e0b' : 'transparent'
                            }
                            className={`${
                              star <= (hoveredStar || currentRating)
                                ? 'text-amber-500'
                                : 'text-zinc-300'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                    {errors.rating && (
                      <p className="text-sm text-rose-500">{errors.rating.message}</p>
                    )}
                  </div>

                  {/* Textarea */}
                  <div>
                    <label
                      htmlFor="content"
                      className="mb-2 block text-sm font-medium text-zinc-700"
                    >
                      评价详情
                    </label>
                    <textarea
                      id="content"
                      rows={4}
                      placeholder="商品满足您的期待吗？说说您的使用体验吧"
                      className={`block w-full rounded-xl border-0 py-3 px-4 text-zinc-900 shadow-sm ring-1 ring-inset ${
                        errors.content
                          ? 'ring-rose-300 placeholder:text-rose-300 focus:ring-rose-500'
                          : 'ring-zinc-300 placeholder:text-zinc-400 focus:ring-indigo-600'
                      } sm:text-sm sm:leading-6 focus:ring-2`}
                      {...register('content')}
                    />
                    {errors.content && (
                      <p className="mt-2 text-sm text-rose-500">{errors.content.message}</p>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="border-t border-zinc-100 bg-zinc-50 p-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  form="review-form"
                  disabled={isSubmitting}
                  className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? '提交中...' : '提交评价'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
