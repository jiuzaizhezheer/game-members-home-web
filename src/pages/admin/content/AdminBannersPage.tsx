import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  X,
  Upload,
  Check,
  ToggleLeft,
  ToggleRight,
  Search,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { adminApi } from '@/features/admin/api'
import { categoryApi } from '@/features/category/api'
import type { AdminBannerItemOut, AdminProductListOut } from '@/features/admin/types'
import type { CategoryOut } from '@/features/category/types'
import { useConfirm } from '@/components/ui/confirmContext'
import { getFileUrl } from '@/shared/utils/file'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { getCroppedImg } from '@/shared/utils/image'
import { useRef } from 'react'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<AdminBannerItemOut[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingBanner, setEditingBanner] = useState<AdminBannerItemOut | null>(null)

  const confirm = useConfirm()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    sort_order: 0,
    is_active: true,
  })

  // Link Helper state
  const [linkType, setLinkType] = useState<'none' | 'product' | 'category'>('none')
  const [targetId, setTargetId] = useState('')
  const [products, setProducts] = useState<AdminProductListOut['items']>([])
  const [categories, setCategories] = useState<CategoryOut[]>([])
  const [isHelperLoading, setIsHelperLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Cropper state
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [isCropping, setIsCropping] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getBanners()
      setBanners(res.items)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  // Load helper data when needed
  useEffect(() => {
    const loadHelperData = async () => {
      if (isModalOpen && (linkType === 'product' || linkType === 'category')) {
        try {
          setIsHelperLoading(true)
          if (linkType === 'product' && products.length === 0) {
            const res = await adminApi.getProducts({ page_size: 100 })
            setProducts(res.items)
          } else if (linkType === 'category' && categories.length === 0) {
            const res = await categoryApi.getAll()
            setCategories(res)
          }
        } catch (error) {
          console.error(error)
        } finally {
          setIsHelperLoading(false)
        }
      }
    }
    loadHelperData()
  }, [isModalOpen, linkType, products.length, categories.length])

  // Sync link_url when targetId or linkType changes
  useEffect(() => {
    if (linkType === 'product' && targetId) {
      setFormData((prev) => ({ ...prev, link_url: `/member/product/${targetId}` }))
    } else if (linkType === 'category' && targetId) {
      setFormData((prev) => ({ ...prev, link_url: `/member/home?category_id=${targetId}` }))
    } else if (linkType === 'none') {
      setFormData((prev) => ({ ...prev, link_url: '' }))
    }
  }, [linkType, targetId])

  const openModal = (banner?: AdminBannerItemOut) => {
    if (banner) {
      setEditingBanner(banner)
      setFormData({
        title: banner.title,
        image_url: banner.image_url,
        link_url: banner.link_url || '',
        sort_order: banner.sort_order,
        is_active: banner.is_active,
      })

      // Infer link type
      const url = banner.link_url || ''
      if (!url) {
        setLinkType('none')
        setTargetId('')
      } else if (url.startsWith('/member/product/')) {
        setLinkType('product')
        setTargetId(url.replace('/member/product/', ''))
      } else if (url.includes('category_id=')) {
        setLinkType('category')
        const match = url.match(/category_id=([^&]+)/)
        setTargetId(match ? match[1] : '')
      } else {
        setLinkType('none')
        setTargetId('')
      }
    } else {
      setEditingBanner(null)
      setFormData({
        title: '',
        image_url: '',
        link_url: '',
        sort_order: 0,
        is_active: true,
      })
      setLinkType('none')
      setTargetId('')
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBanner(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setTempImage(reader.result as string)
      setShowCropper(true)
    })
    reader.readAsDataURL(file)
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget.getBoundingClientRect()
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        21 / 9,
        width,
        height,
      ),
      width,
      height,
    )
    setCrop(initialCrop)
    setCompletedCrop(convertToPixelCrop(initialCrop, width, height))
  }

  const handleCropConfirm = async () => {
    if (!tempImage || !completedCrop || !imgRef.current) return

    try {
      setIsCropping(true)

      // 计算缩放比例：原始尺寸 / 显示尺寸
      const { naturalWidth, naturalHeight, width, height } = imgRef.current
      const scaleX = naturalWidth / width
      const scaleY = naturalHeight / height

      // 将基于显示尺寸的坐标转换为基于原始尺寸的坐标
      const pixelCrop: PixelCrop = {
        unit: 'px',
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      }

      const croppedBlob = await getCroppedImg(tempImage, pixelCrop)
      if (!croppedBlob) throw new Error('裁切失败')

      const file = new File([croppedBlob], 'banner.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/commons/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.data?.url) {
        setFormData((prev) => ({ ...prev, image_url: data.data.url }))
        setShowCropper(false)
        setTempImage(null)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsCropping(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.image_url) {
      return
    }

    try {
      setIsSubmitting(true)
      if (editingBanner) {
        await adminApi.updateBanner(editingBanner.id, formData)
      } else {
        await adminApi.createBanner(formData)
      }
      closeModal()
      fetchBanners()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (banner: AdminBannerItemOut) => {
    if (
      !(await confirm({
        title: '删除轮播图',
        description: `确定要删除 "${banner.title}" 吗？此操作不可恢复。`,
        confirmText: '删除',
        variant: 'danger',
      }))
    )
      return

    try {
      await adminApi.deleteBanner(banner.id)
      setBanners((prev) => prev.filter((b) => b.id !== banner.id))
    } catch (error) {
      console.error(error)
    }
  }

  const toggleStatus = async (banner: AdminBannerItemOut) => {
    try {
      const newActive = !banner.is_active
      await adminApi.updateBanner(banner.id, { is_active: newActive })
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: newActive } : b)),
      )
      toast.success(newActive ? '已启用' : '已禁用')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">内容运营</h1>
          <p className="mt-1 text-sm text-zinc-500">管理首页顶部的轮播图推荐位</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 hover:scale-[1.02] active:scale-95"
        >
          <Plus size={18} />
          新增轮播图
        </button>
      </div>

      {/* Grid List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            <p className="mt-4 text-sm">正在加载轮播图...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full rounded-3xl border-2 border-dashed border-zinc-200 py-24 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 text-lg font-medium text-zinc-900">暂无轮播图</h3>
            <p className="mt-1 text-sm text-zinc-500">点击右上角按钮开始添加第一条内容</p>
          </div>
        ) : (
          banners.map((banner) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all hover:shadow-xl hover:shadow-zinc-200/50"
            >
              {/* Image Preview */}
              <div className="aspect-[21/9] w-full overflow-hidden bg-zinc-100">
                <img
                  src={getFileUrl(banner.image_url)}
                  alt={banner.title}
                  className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${!banner.is_active ? 'grayscale opacity-50' : ''}`}
                />
              </div>

              {/* Status Badge */}
              <div className="absolute left-4 top-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${banner.is_active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200/50' : 'bg-zinc-800 text-white'}`}
                >
                  {banner.is_active ? 'Displaying' : 'Hidden'}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-bold text-zinc-900 truncate" title={banner.title}>
                  {banner.title}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                  <ExternalLink size={12} />
                  <span className="truncate flex-1" title={banner.link_url || '无跳转链接'}>
                    {banner.link_url || '无跳转链接'}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(banner)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(banner)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-all hover:bg-rose-100 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleStatus(banner)}
                    className={`flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-all ${banner.is_active ? 'bg-zinc-800 text-white hover:bg-zinc-900' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                  >
                    {banner.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {banner.is_active ? '下架' : '发布'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-900">
                  {editingBanner ? '编辑轮播图' : '新增轮播图'}
                </h2>
                <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-zinc-700">标题</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:bg-white focus:outline-rose-500/20 focus:ring-4 focus:ring-rose-500/5 transition-all"
                    placeholder="请输入展示标题"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                    图片展示
                  </label>
                  <div className="group relative aspect-[21/9] w-full cursor-pointer overflow-hidden rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-200 transition-all hover:border-rose-500/50">
                    {formData.image_url ? (
                      <>
                        <img
                          src={getFileUrl(formData.image_url)}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <Upload className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-zinc-400">
                        <Upload size={32} />
                        <p className="mt-2 text-xs">点击上传 Banner 图片 (建议 21:9)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                    跳转链接
                  </label>
                  <div className="space-y-3">
                    <select
                      disabled={isHelperLoading}
                      value={linkType}
                      onChange={(e) => {
                        const type = e.target.value as 'none' | 'product' | 'category'
                        setLinkType(type)
                      }}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:bg-white transition-all disabled:opacity-50"
                    >
                      <option value="none">无跳转</option>
                      <option value="product">
                        跳转到商品 {isHelperLoading && linkType === 'product' ? '(加载中...)' : ''}
                      </option>
                      <option value="category">
                        跳转到分类 {isHelperLoading && linkType === 'category' ? '(加载中...)' : ''}
                      </option>
                    </select>

                    {linkType === 'product' && (
                      <div className="space-y-3">
                        {targetId && products.find((p) => p.id === targetId) ? (
                          <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/30 p-3 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-rose-200 bg-white shadow-sm">
                              <img
                                src={getFileUrl(
                                  products.find((p) => p.id === targetId)?.image_url || '',
                                )}
                                className="h-full w-full object-cover"
                                alt="选中商品"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-zinc-900 truncate">
                                {products.find((p) => p.id === targetId)?.name}
                              </div>
                              <div className="text-[10px] text-rose-600 font-medium">
                                ￥{products.find((p) => p.id === targetId)?.price}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setTargetId('')
                                setSearchQuery('')
                              }}
                              className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-zinc-500 shadow-sm ring-1 ring-zinc-200 transition-all hover:bg-zinc-50 hover:text-zinc-900 active:scale-95"
                            >
                              更换商品
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                              <input
                                type="text"
                                placeholder="搜索商品..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500/30 transition-all"
                              />
                            </div>

                            <div className="max-h-[220px] overflow-y-auto rounded-xl border border-zinc-100 bg-zinc-50/50 p-1.5 space-y-1 custom-scrollbar">
                              {isHelperLoading ? (
                                <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <p className="mt-2 text-[10px]">加载中...</p>
                                </div>
                              ) : products.filter(
                                  (p) =>
                                    !searchQuery ||
                                    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
                                ).length === 0 ? (
                                <div className="py-8 text-center text-[10px] text-zinc-400">
                                  未找到相关商品
                                </div>
                              ) : (
                                products
                                  .filter(
                                    (p) =>
                                      !searchQuery ||
                                      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
                                  )
                                  .map((p) => (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => setTargetId(p.id)}
                                      className={`flex w-full items-center gap-3 rounded-lg p-2 transition-all hover:bg-white hover:shadow-sm ${targetId === p.id ? 'bg-white ring-1 ring-rose-500/20 shadow-sm' : ''}`}
                                    >
                                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-white">
                                        <img
                                          src={getFileUrl(p.image_url || '')}
                                          className="h-full w-full object-cover"
                                          alt={p.name}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0 text-left">
                                        <div className="text-xs font-semibold text-zinc-900 truncate">
                                          {p.name}
                                        </div>
                                        <div className="text-[10px] text-zinc-500">￥{p.price}</div>
                                      </div>
                                      {targetId === p.id && (
                                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                                      )}
                                    </button>
                                  ))
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {linkType === 'category' && (
                      <div className="space-y-3">
                        {targetId && categories.find((c) => c.id === targetId) ? (
                          <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/30 p-3 shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                                <span className="text-[10px] font-bold">CAT</span>
                              </div>
                              <div className="text-xs font-bold text-zinc-900">
                                {categories.find((c) => c.id === targetId)?.name}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setTargetId('')}
                              className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-zinc-500 shadow-sm ring-1 ring-zinc-200 transition-all hover:bg-zinc-50 hover:text-zinc-900 active:scale-95"
                            >
                              更换分类
                            </button>
                          </div>
                        ) : (
                          <div className="max-h-[180px] overflow-y-auto rounded-xl border border-zinc-100 bg-zinc-50/50 p-1.5 space-y-1 custom-scrollbar">
                            {isHelperLoading ? (
                              <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              categories.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => setTargetId(c.id)}
                                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs transition-all hover:bg-white hover:shadow-sm ${targetId === c.id ? 'bg-white ring-1 ring-indigo-500/20 font-bold text-indigo-600 shadow-sm' : 'text-zinc-700'}`}
                                >
                                  {c.name}
                                  {targetId === c.id && <Check size={14} />}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {linkType !== 'none' && formData.link_url && (
                      <div className="px-1 text-[10px] font-mono text-zinc-400 break-all">
                        自动生成: {formData.link_url}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                      排序权重
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, sort_order: parseInt(e.target.value) }))
                      }
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:bg-white transition-all"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                      发布状态
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, is_active: !p.is_active }))}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all ${formData.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}
                    >
                      {formData.is_active ? <Check size={16} /> : null}
                      {formData.is_active ? '正式上线' : '草稿'}
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-full border border-zinc-200 py-3 text-sm font-bold text-zinc-500 transition-all hover:bg-zinc-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {editingBanner ? '更新发布' : '立即创建'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cropper Modal */}
      <AnimatePresence>
        {showCropper && tempImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">调整轮播图区域</h2>
                  <p className="text-sm text-zinc-500 mt-1">拖拽或缩放方框来选择显示区域 (21:9)</p>
                </div>
                <button
                  onClick={() => {
                    setShowCropper(false)
                    setTempImage(null)
                  }}
                  className="h-12 w-12 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="relative flex-1 overflow-auto bg-zinc-950 p-8 flex items-center justify-center custom-scrollbar">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(pixelCrop) => {
                    setCompletedCrop(pixelCrop)
                  }}
                  aspect={21 / 9}
                  className="max-h-full"
                >
                  <img
                    ref={imgRef}
                    src={tempImage}
                    onLoad={onImageLoad}
                    className="max-h-[60vh] max-w-full block shadow-2xl rounded-sm"
                    alt="Crop source"
                  />
                </ReactCrop>
              </div>

              <div className="flex items-center justify-between px-8 py-6 bg-zinc-900/50 border-t border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {completedCrop &&
                      `${Math.round(completedCrop.width)} x ${Math.round(completedCrop.height)} px`}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowCropper(false)
                      setTempImage(null)
                    }}
                    className="rounded-full px-8 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleCropConfirm}
                    disabled={isCropping}
                    className="flex items-center gap-2 rounded-full bg-rose-600 px-10 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-4px_rgba(225,29,72,0.4)] transition-all hover:bg-rose-700 hover:translate-y-[-2px] active:translate-y-[0] active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                  >
                    {isCropping ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                    确认选区并上传
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
