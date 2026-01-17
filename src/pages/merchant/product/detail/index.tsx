import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  Package,
  Layers,
  Type,
} from 'lucide-react'

import { productService } from '@/features/product/service'
import { categoryService } from '@/features/category/service'
import { ProductSchema, type ProductIn } from '@/features/product/types'
import type { Category } from '@/features/category/types'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const form = useForm<ProductIn>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      price: 0,
      stock: 0,
      image_url: '',
      category_ids: [],
    },
  })

  // 加载初始数据
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      try {
        // 并行加载分类和商品详情（如果是编辑）
        const [categoryRes, productRes] = await Promise.all([
          categoryService.getAll(),
          isEdit && id ? productService.getDetail(id) : Promise.resolve(null),
        ])

        setCategories(categoryRes)

        if (productRes) {
          // 设置表单值
          form.reset({
            name: productRes.name,
            sku: productRes.sku || '',
            description: productRes.description || '',
            price: Number(productRes.price),
            stock: productRes.stock,
            image_url: productRes.image_url || '',
            // 目前后端返回的数据可能还没有 categories 字段，待确认，暂时为空
            // 实际项目中这里需要后端返回商品关联的分类ID列表
            category_ids: [],
          })
        }
      } catch (error) {
        console.error(error)
        toast.error('加载数据失败')
        navigate('/merchant/product/list')
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [id, isEdit, navigate, form])

  const onSubmit = async (data: ProductIn) => {
    setIsSubmitting(true)
    try {
      if (isEdit && id) {
        await productService.update(id, data)
        toast.success('商品更新成功')
      } else {
        await productService.create(data)
        toast.success('商品创建成功')
      }
      navigate('/merchant/product/list')
    } catch (error) {
      console.error(error)
      toast.error(isEdit ? '更新失败' : '创建失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/merchant/product/list')}
          className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {isEdit ? '编辑商品' : '新建商品'}
          </h1>
          <p className="text-sm text-zinc-500">
            {isEdit ? '修改商品详细信息' : '填写下方信息以前加新商品'}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-zinc-900">基本信息</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">商品名称</label>
                <div className="relative">
                  <Type className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    {...form.register('name')}
                    placeholder="例如：高级游戏鼠标垫"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                {form.formState.errors.name && (
                  <p className="text-xs text-rose-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">商品描述</label>
                <textarea
                  {...form.register('description')}
                  rows={4}
                  placeholder="详细描述商品的特点..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-zinc-900">价格与库存</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">价格 (¥)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="number"
                    step="0.01"
                    {...form.register('price', { valueAsNumber: true })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                {form.formState.errors.price && (
                  <p className="text-xs text-rose-500">{form.formState.errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">库存</label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="number"
                    {...form.register('stock', { valueAsNumber: true })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                {form.formState.errors.stock && (
                  <p className="text-xs text-rose-500">{form.formState.errors.stock.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">SKU (可选)</label>
                <input
                  {...form.register('sku')}
                  placeholder="例如：GM-MOUSE-001"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-6">
          {/* Image Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-zinc-900">商品图片</h2>
            <div className="space-y-4">
              <div className="aspect-square w-full overflow-hidden rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50">
                {form.watch('image_url') ? (
                  <img
                    src={form.watch('image_url') || ''}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-zinc-400">
                    <ImageIcon className="mb-2 h-8 w-8" />
                    <span className="text-xs">预览区域</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">图片 URL</label>
                <input
                  {...form.register('image_url')}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
                <p className="text-xs text-zinc-400">暂仅支持外部图片链接</p>
              </div>
            </div>
          </div>

          {/* Category Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
              <Layers size={20} />
              <span>分类</span>
            </h2>
            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
              {categories.length === 0 ? (
                <div className="text-sm text-zinc-400 py-4 text-center">暂无分类</div>
              ) : (
                categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-zinc-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={category.id}
                      {...form.register('category_ids')}
                      className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-zinc-700">{category.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="sticky top-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              {isEdit ? '保存修改' : '立即发布'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
