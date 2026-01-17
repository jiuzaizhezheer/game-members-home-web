import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Store, Phone, FileText, Save, Loader2, Camera } from 'lucide-react'

import { merchantService } from '@/features/merchant/service'
import { MerchantUpdateSchema, type MerchantUpdateIn } from '@/features/merchant/types'

export default function MerchantSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [merchantId, setMerchantId] = useState<string>('')

  const form = useForm<MerchantUpdateIn>({
    resolver: zodResolver(MerchantUpdateSchema),
    defaultValues: {
      shop_name: '',
      contact_phone: '',
      shop_desc: '',
    },
  })

  // 加载数据
  useEffect(() => {
    const fetchMerchant = async () => {
      setIsLoading(true)
      try {
        const merchant = await merchantService.getMyMerchant()
        setMerchantId(merchant.id)
        form.reset({
          shop_name: merchant.shop_name,
          contact_phone: merchant.contact_phone || '',
          shop_desc: merchant.shop_desc || '',
        })
      } catch (error) {
        console.error(error)
        toast.error('加载店铺信息失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMerchant()
  }, [form])

  const onSubmit = async (data: MerchantUpdateIn) => {
    setIsSubmitting(true)
    try {
      await merchantService.update(merchantId, data)
      toast.success('店铺信息更新成功')
    } catch (error) {
      console.error(error)
      toast.error('更新失败')
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
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">店铺设置</h1>
        <p className="mt-1 text-sm text-zinc-500">管理您的店铺基本资料和对外展示信息。</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* 主要信息卡片 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Store size={20} />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">基本资料</h2>
          </div>

          <div className="space-y-5">
            {/* Logo Upload Placeholder */}
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 group cursor-pointer hover:border-indigo-500 transition-colors">
                <div className="flex h-full w-full items-center justify-center text-zinc-400 group-hover:text-indigo-500">
                  <Camera size={20} />
                </div>
                {/* Simulated Upload Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  更换Logo
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-zinc-900">店铺 Logo</h3>
                <p className="text-sm text-zinc-500">建议尺寸 400x400px，支持 JPG、PNG。</p>
                <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-500">
                  暂未开放上传
                </span>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4"></div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">店铺名称</label>
                <input
                  {...form.register('shop_name')}
                  type="text"
                  placeholder="给你的店铺起个好名字"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
                {form.formState.errors.shop_name && (
                  <p className="text-xs text-rose-500">{form.formState.errors.shop_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">联系电话</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                  <input
                    {...form.register('contact_phone')}
                    type="tel"
                    placeholder="客服/售后联系方式"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                {form.formState.errors.contact_phone && (
                  <p className="text-xs text-rose-500">
                    {form.formState.errors.contact_phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">店铺简介</label>
              <div className="relative">
                <textarea
                  {...form.register('shop_desc')}
                  rows={3}
                  placeholder="向顾客介绍一下你的店铺..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
                <FileText className="absolute right-4 top-4 h-5 w-5 text-zinc-400 pointer-events-none opacity-50" />
              </div>
              {form.formState.errors.shop_desc && (
                <p className="text-xs text-rose-500">{form.formState.errors.shop_desc.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-4 rounded-2xl bg-zinc-50 p-3 border border-zinc-200">
          <span className="text-sm text-zinc-500">别忘了保存你的修改 →</span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all hover:scale-105 hover:bg-zinc-800 focus:ring-4 focus:ring-zinc-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            保存设置
          </button>
        </div>
      </form>
    </div>
  )
}
