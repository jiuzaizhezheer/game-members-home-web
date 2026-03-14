import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Camera, Save, Loader2, Shield, KeyRound } from 'lucide-react'

import { userService } from '@/features/user/service'
import {
  UserProfileUpdateInSchema,
  type UserOut,
  type UserProfileUpdateIn,
} from '@/features/user/types'
import { commonApi } from '@/features/common/api'
import { getFileUrl } from '@/shared/utils/file'
import { useAuth } from '@/contexts/AuthContext'
import ChangePasswordModal from '@/components/ui/ChangePasswordModal'

export default function MerchantAccount() {
  const [profile, setProfile] = useState<UserOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [pwdModalOpen, setPwdModalOpen] = useState(false)
  const { updateUser } = useAuth()

  const profileForm = useForm<UserProfileUpdateIn>({
    resolver: zodResolver(UserProfileUpdateInSchema),
  })

  const avatarUrl = profileForm.watch('avatar_url')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const data = await userService.getMe()
        setProfile(data)
        profileForm.reset({
          username: data.username || '',
          avatar_url: data.avatar_url || '',
          email: data.email || '',
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [profileForm])

  const onAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { url } = await commonApi.uploadFile(file)
      profileForm.setValue('avatar_url', url, { shouldDirty: true })
    } catch (error) {
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const onProfileSubmit = async (data: UserProfileUpdateIn) => {
    try {
      setUpdating(true)
      const updated = await userService.updateProfile(data)
      setProfile(updated)
      updateUser({
        username: updated.username,
        avatar_url: updated.avatar_url,
      })
      profileForm.reset(data)
    } catch (error) {
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">个人中心</h1>
        <p className="mt-1 text-sm text-zinc-500">管理您的账户信息和安全设置</p>
      </div>

      {/* ── 个人资料卡片 ── */}
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <User size={20} />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">基本资料</h2>
          </div>

          <div className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="group relative cursor-pointer overflow-hidden rounded-full transition-all active:scale-95">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-zinc-200 bg-zinc-50 transition-colors group-hover:border-indigo-500">
                  {avatarUrl ? (
                    <img
                      src={getFileUrl(avatarUrl)}
                      alt="头像"
                      className="h-full w-full object-cover"
                    />
                  ) : profile?.avatar_url ? (
                    <img
                      src={getFileUrl(profile.avatar_url)}
                      alt="头像"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400 group-hover:text-indigo-500">
                      {isUploading ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                    </div>
                  )}
                </div>

                {!isUploading && (
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={onAvatarUpload}
                      disabled={isUploading}
                    />
                    更换头像
                  </label>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/60">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-zinc-900">个人头像</h3>
                <p className="max-w-[200px] text-xs text-zinc-500">
                  推荐使用正方形图片，支持 JPG/PNG 格式。
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4" />

            <div className="grid gap-5 md:grid-cols-2">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">用户名</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                  <input
                    {...profileForm.register('username')}
                    type="text"
                    placeholder="请输入用户名"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                {profileForm.formState.errors.username && (
                  <p className="text-xs text-rose-500">
                    {profileForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">邮箱地址</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                  <input
                    {...profileForm.register('email')}
                    type="email"
                    placeholder="yourname@example.com"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                {profileForm.formState.errors.email && (
                  <p className="text-xs text-rose-500">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
          <span className="text-sm text-zinc-500">别忘了保存你的修改 →</span>
          <button
            type="submit"
            disabled={!profileForm.formState.isDirty || updating}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all hover:scale-105 hover:bg-zinc-800 focus:ring-4 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {updating ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            保存资料
          </button>
        </div>
      </form>

      {/* ── 账户安全卡片 ── */}
      <section className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600 transition-colors group-hover:bg-amber-100">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">账户安全</h3>
            <p className="text-sm text-zinc-500">修改您的登录密码，保障账户安全</p>
          </div>
        </div>
        <button
          onClick={() => setPwdModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-100 active:scale-95"
        >
          <KeyRound className="h-4 w-4" />
          修改密码
        </button>
      </section>

      <ChangePasswordModal open={pwdModalOpen} onClose={() => setPwdModalOpen(false)} />
    </div>
  )
}
