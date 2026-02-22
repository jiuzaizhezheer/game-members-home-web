import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Loader2, Search, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'

import { promotionApi } from '@/features/marketing/api'
import { promotionCreateSchema, type PromotionCreateForm } from '@/features/marketing/schemas'
import {
  DISCOUNT_TYPES,
  DISCOUNT_TYPE_OPTIONS,
  PROMOTION_STATUS,
} from '@/features/marketing/constants'
import { productApi } from '@/features/product/api'
import type { ProductOut } from '@/features/product/types'
import { getFileUrl } from '@/shared/utils/file'

export default function PromotionCreatePage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [products, setProducts] = useState<ProductOut[]>([])
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromotionCreateForm>({
    resolver: zodResolver(promotionCreateSchema) as Resolver<PromotionCreateForm>,
    defaultValues: {
      title: '',
      discount_type: DISCOUNT_TYPES.PERCENT,
      discount_value: 0,
      start_at: '',
      end_at: '',
      product_ids: [],
      status: PROMOTION_STATUS.ACTIVE,
    },
  })

  const selectedProductIds = watch('product_ids')
  const discountType = watch('discount_type')

  const loadProducts = useCallback(async () => {
    try {
      const res = await productApi.getMerchantList({ page: 1, page_size: 100 })
      setProducts(res.items)
    } catch {
      toast.error('加载商品失败')
    }
  }, [])

  const loadPromotion = useCallback(async () => {
    if (!id) return
    try {
      const data = await promotionApi.get(id)
      setValue('title', data.title)
      setValue('discount_type', data.discount_type)
      setValue('discount_value', Number(data.discount_value))
      setValue('status', data.status)

      // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
      const formatForInput = (dateStr: string) => {
        const date = new Date(dateStr)
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
        return date.toISOString().slice(0, 16)
      }

      setValue('start_at', formatForInput(data.start_at))
      setValue('end_at', formatForInput(data.end_at))
      setValue(
        'product_ids',
        data.products.map((p) => p.id),
      )
    } catch {
      toast.error('加载活动详情失败')
      navigate('/merchant/marketing/promotions')
    } finally {
      setLoading(false)
    }
  }, [id, navigate, setValue])

  useEffect(() => {
    loadProducts()
    if (isEdit) {
      loadPromotion()
    }
  }, [isEdit, loadProducts, loadPromotion])

  const onSubmit = async (data: PromotionCreateForm) => {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        start_at: new Date(data.start_at).toISOString(),
        end_at: new Date(data.end_at).toISOString(),
      }

      if (isEdit) {
        await promotionApi.update(id!, payload)
        toast.success('更新成功')
      } else {
        await promotionApi.create(payload)
        toast.success('创建成功')
      }
      navigate('/merchant/marketing/promotions')
    } catch (error) {
      const err = error as { message?: string }
      toast.error(err.message || '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleProduct = (productId: string) => {
    const current = selectedProductIds || []
    if (current.includes(productId)) {
      setValue(
        'product_ids',
        current.filter((id) => id !== productId),
      )
    } else {
      setValue('product_ids', [...current, productId])
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  )

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" />
      </div>
    )

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link
          to="/merchant/marketing/promotions"
          className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">{isEdit ? '编辑活动' : '创建活动'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-zinc-900">基本信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">活动标题</label>
                  <input
                    {...register('title')}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="例如：夏季清仓特惠"
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">开始时间</label>
                    <input
                      type="datetime-local"
                      {...register('start_at')}
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                    {errors.start_at && (
                      <p className="mt-1 text-xs text-rose-500">{errors.start_at.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">结束时间</label>
                    <input
                      type="datetime-local"
                      {...register('end_at')}
                      className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                    {errors.end_at && (
                      <p className="mt-1 text-xs text-rose-500">{errors.end_at.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-zinc-900">优惠规则</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">优惠类型</label>
                  <select
                    {...register('discount_type')}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white"
                  >
                    {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    {discountType === DISCOUNT_TYPES.PERCENT ? '折扣力度 (%)' : '减免金额 (¥)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('discount_value')}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder={discountType === DISCOUNT_TYPES.PERCENT ? '20 (=8折)' : '50'}
                  />
                  {errors.discount_value && (
                    <p className="mt-1 text-xs text-rose-500">{errors.discount_value.message}</p>
                  )}
                </div>
              </div>
              {discountType === DISCOUNT_TYPES.PERCENT && (
                <p className="mt-2 text-xs text-zinc-500">
                  输入 20 代表 优惠 20% (即8折)，输入 50 代表半价。
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Products */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-900">参与商品</h3>
                <span className="text-sm font-medium text-zinc-500">
                  已选 {selectedProductIds?.length || 0}
                </span>
              </div>

              {errors.product_ids && (
                <p className="mb-2 text-xs text-rose-500">{errors.product_ids.message}</p>
              )}

              <div className="flex-1 overflow-y-auto max-h-[500px] space-y-2 border border-zinc-100 rounded-xl p-2 bg-zinc-50/50">
                {selectedProductIds && selectedProductIds.length > 0 ? (
                  products
                    .filter((p) => selectedProductIds.includes(p.id))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-lg bg-white p-2 shadow-sm border border-zinc-100"
                      >
                        <img
                          src={getFileUrl(p.image_url)}
                          className="h-10 w-10 rounded-lg object-cover bg-zinc-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm font-medium text-zinc-900">{p.name}</div>
                          <div className="text-xs text-zinc-500">¥{p.price}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleProduct(p.id)}
                          className="p-1 text-zinc-400 hover:text-rose-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 py-10">
                    <p className="text-sm">暂无选定商品</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsProductModalOpen(true)}
                className="mt-4 w-full rounded-xl border-dashed border-2 border-indigo-200 bg-indigo-50 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
              >
                + 选择商品
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-4 border-t border-zinc-200 pt-6">
          <button
            type="button"
            onClick={() => navigate('/merchant/marketing/promotions')}
            className="px-6 py-2.5 text-sm font-bold text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
          >
            {submitting && <Loader2 className="animate-spin" size={16} />}
            保存活动
          </button>
        </div>
      </form>

      {/* Product Selection Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsProductModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-zinc-900">选择商品</h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="rounded-full p-2 hover:bg-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="搜索商品名称..."
                className="w-full rounded-xl border border-zinc-200 pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-1">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductIds?.includes(p.id)
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProduct(p.id)}
                    className={`flex items-center gap-4 rounded-xl border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50'
                        : 'border-zinc-100 hover:border-indigo-200 hover:bg-zinc-50'
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-zinc-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={14} />}
                    </div>
                    <img
                      src={getFileUrl(p.image_url)}
                      className="h-12 w-12 rounded-lg object-cover bg-zinc-100"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-zinc-900">{p.name}</div>
                      <div className="text-sm text-zinc-500">库存: {p.stock}</div>
                    </div>
                    <div className="font-bold text-indigo-600">¥{p.price}</div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="rounded-full bg-indigo-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
              >
                完成 ({selectedProductIds?.length || 0})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
