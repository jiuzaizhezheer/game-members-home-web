import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Edit2, Star, Loader2, ArrowLeft, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressService } from '@/features/address/service'
import {
  AddressCreateInSchema,
  type AddressCreateIn,
  type AddressOut,
} from '@/features/address/types'
import { useNavigate } from 'react-router-dom'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export default function AddressListPage() {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<AddressOut[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const confirm = useConfirm()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddressCreateIn>({
    resolver: zodResolver(AddressCreateInSchema),
    defaultValues: {
      is_default: false,
    },
  })

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await addressService.getMyAddresses()
      setAddresses(data)
    } catch (error) {
      console.error('Failed to fetch addresses', error)
      toast.error('加载地址失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const onSubmit = async (data: AddressCreateIn) => {
    setSubmitting(true)
    try {
      if (editingId) {
        await addressService.updateAddress(editingId, data)
        toast.success('更新成功')
      } else {
        await addressService.addAddress(data)
        toast.success('添加成功')
      }
      setIsFormOpen(false)
      setEditingId(null)
      reset()
      await fetchAddresses()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (addr: AddressOut) => {
    setEditingId(addr.id)
    setValue('receiver_name', addr.receiver_name)
    setValue('phone', addr.phone)
    setValue('province', addr.province)
    setValue('city', addr.city)
    setValue('district', addr.district)
    setValue('detail', addr.detail)
    setValue('is_default', addr.is_default)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: '删除地址',
      description: '确定要删除该地址吗？',
      confirmText: '确定删除',
      cancelText: '取消',
      variant: 'danger',
    })
    if (!confirmed) return
    try {
      await addressService.deleteAddress(id)
      toast.success('已删除')
      await fetchAddresses()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  const handleToggleDefault = async (addr: AddressOut) => {
    if (addr.is_default) return
    try {
      await addressService.setDefault(addr.id)
      toast.success('默认地址已更改')
      await fetchAddresses()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '设置失败')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">收货地址</h1>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            reset()
            setIsFormOpen(true)
          }}
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          新增地址
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group relative rounded-2xl border p-6 transition-all ${
                addr.is_default
                  ? 'border-indigo-600 bg-indigo-50/30'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">{addr.receiver_name}</h3>
                  <p className="mt-1 text-sm font-medium text-zinc-500">{addr.phone}</p>
                </div>
                <button
                  onClick={() => handleToggleDefault(addr)}
                  className={`p-2 rounded-full transition-colors ${
                    addr.is_default
                      ? 'text-amber-500'
                      : 'text-zinc-300 hover:text-amber-400 hover:bg-amber-50'
                  }`}
                  title={addr.is_default ? '默认地址' : '设为默认'}
                >
                  <Star size={20} fill={addr.is_default ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="mt-4 text-sm leading-relaxed text-zinc-600">
                <p>
                  {addr.province} {addr.city} {addr.district}
                </p>
                <p className="mt-1">{addr.detail}</p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleEdit(addr)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
                >
                  <Edit2 size={14} />
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 size={14} />
                  删除
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Address Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-zinc-900">
                  {editingId ? '编辑地址' : '新增地址'}
                </h2>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                      收件人
                    </label>
                    <input
                      {...register('receiver_name')}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      placeholder="姓名"
                    />
                    {errors.receiver_name && (
                      <p className="text-xs text-rose-500 ml-1">{errors.receiver_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                      联系电话
                    </label>
                    <input
                      {...register('phone')}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      placeholder="手机号"
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-500 ml-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                      省份
                    </label>
                    <input
                      {...register('province')}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      placeholder="如：广东省"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                      城市
                    </label>
                    <input
                      {...register('city')}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      placeholder="如：深圳市"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                      区县
                    </label>
                    <input
                      {...register('district')}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      placeholder="可选"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                    详细地址
                  </label>
                  <textarea
                    {...register('detail')}
                    rows={3}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                    placeholder="街道、楼牌号等"
                  />
                  {errors.detail && (
                    <p className="text-xs text-rose-500 ml-1">{errors.detail.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="default"
                    {...register('is_default')}
                    className="w-5 h-5 rounded-lg border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label
                    htmlFor="default"
                    className="text-sm font-medium text-zinc-700 cursor-pointer"
                  >
                    设为默认收货地址
                  </label>
                </div>

                <div className="mt-8">
                  <button
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-zinc-900 py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : '保存地址'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
