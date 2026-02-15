import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2, DollarSign, Package, Layers, Type, Upload } from 'lucide-react'

import { productService } from '@/features/product/service'
import { categoryService } from '@/features/category/service'
import { commonApi } from '@/features/common/api'
import { ProductSchema, type ProductIn } from '@/features/product/types'
import type { CategoryOut } from '@/features/category/types'
import { getFileUrl } from '@/shared/utils/file'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState<CategoryOut[]>([])

  const form = useForm<ProductIn>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      price: undefined as unknown as number,
      stock: undefined as unknown as number,
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
          isEdit && id ? productService.getMerchantDetail(id) : Promise.resolve(null),
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
            category_ids: productRes.category_ids || [],
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

  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { url } = await commonApi.uploadFile(file)
      form.setValue('image_url', url, { shouldDirty: true })
      toast.success('图片上传成功')
    } catch (error) {
      console.error(error)
      toast.error('上传失败')
    } finally {
      setIsUploading(false)
    }
  }

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

  // 计算图片预览 URL
  const imageUrl = form.watch('image_url')
  const previewUrl = getFileUrl(imageUrl)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/merchant/product/list')}
          className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            {isEdit ? '编辑商品' : '新建商品'}
          </h1>
          <p className="text-sm text-zinc-500">
            {isEdit ? '修改商品详细信息' : '填写下方信息以添加新商品'}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 lg:grid-cols-3">
        {/* Left Column: Main Info */}
        <div className="space-y-5 lg:col-span-2">
          {/* Basic Info Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">基本信息</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-700">商品名称</label>
                <div className="relative">
                  <Type className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    {...form.register('name')}
                    placeholder="例如：高级游戏鼠标垫"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                {form.formState.errors.name && (
                  <p className="text-xs text-rose-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-700">商品描述</label>
                <textarea
                  {...form.register('description')}
                  rows={3}
                  placeholder="详细描述商品的特点..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">价格与库存</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-700">价格 (¥)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="number"
                    step="0.01"
                    {...form.register('price', { valueAsNumber: true })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                {form.formState.errors.price && (
                  <p className="text-xs text-rose-500">{form.formState.errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-700">库存</label>
                <div className="relative">
                  <Package className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="number"
                    {...form.register('stock', { valueAsNumber: true })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                {form.formState.errors.stock && (
                  <p className="text-xs text-rose-500">{form.formState.errors.stock.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-700">SKU (可选)</label>
                <input
                  {...form.register('sku')}
                  placeholder="例如：GM-MOUSE-001"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-5">
          {/* Image Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">商品图片</h2>
            <div className="space-y-4">
              <label className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:border-indigo-500 active:scale-[0.98]">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-zinc-400 group-hover:text-indigo-500">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <>
                        <Upload className="mb-2 h-8 w-8" />
                        <span className="text-xs font-medium">点击上传</span>
                      </>
                    )}
                  </div>
                )}

                {/* Hover Overlay */}
                {previewUrl && !isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Upload className="mr-2 h-4 w-4" />
                    更换图片
                  </div>
                )}

                {/* Uploading Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                )}

                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onImageUpload}
                  disabled={isUploading}
                />
              </label>

              <p className="text-[10px] text-center text-zinc-400">
                支持 JPG、PNG、WebP 格式，建议比例 4:3
              </p>
            </div>
          </div>

          {/* Category Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <Layers size={18} />
              <span>分类</span>
            </h2>
            <div className="max-h-[240px] overflow-y-auto pr-2 space-y-1">
              {categories.length === 0 ? (
                <div className="text-sm text-zinc-400 py-4 text-center">暂无分类</div>
              ) : (
                categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-zinc-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={category.id}
                      {...form.register('category_ids')}
                      className="h-3.5 w-3.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
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
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
              {isEdit ? '保存修改' : '立即发布'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
