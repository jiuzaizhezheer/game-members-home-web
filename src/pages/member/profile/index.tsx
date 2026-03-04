import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Mail,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Camera,
  Loader2,
  MapPin,
  KeyRound,
  MessageSquare,
  Coins,
  ChevronRight,
  Ticket,
} from 'lucide-react'
import { userService } from '@/features/user/service'
import PointBadge from '@/components/ui/PointBadges'
import {
  UserProfileUpdateInSchema,
  type UserOut,
  type UserProfileUpdateIn,
} from '@/features/user/types'
import { commonApi } from '@/features/common/api'
import { getFileUrl } from '@/shared/utils/file'
import { useAuth } from '@/contexts/AuthContext'
import ChangePasswordModal from '@/components/ui/ChangePasswordModal'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [pwdModalOpen, setPwdModalOpen] = useState(false)
  const { updateUser } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UserProfileUpdateIn>({
    resolver: zodResolver(UserProfileUpdateInSchema),
  })

  const avatarUrl = watch('avatar_url')

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const data = await userService.getMe()
      setProfile(data)
      reset({
        username: data.username || '',
        avatar_url: data.avatar_url || '',
        email: data.email || '',
      })
    } catch (error) {
      console.error('Failed to fetch profile', error)
      toast.error('获取个人资料失败')
    } finally {
      setLoading(false)
    }
  }, [reset])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const onSubmit = async (data: UserProfileUpdateIn) => {
    try {
      setUpdating(true)
      const updated = await userService.updateProfile(data)
      setProfile(updated)
      updateUser({
        username: updated.username,
        avatar_url: updated.avatar_url,
      })
      reset(data)
      toast.success('个人资料已更新')
    } catch (error) {
      console.error('Update profile failed', error)
      toast.error('更新失败，请稍后重试')
    } finally {
      setUpdating(false)
    }
  }

  const onAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { url } = await commonApi.uploadFile(file)
      setValue('avatar_url', url, { shouldDirty: true })
      toast.success('请点击“保存更改”按钮以应用修改')
    } catch (error) {
      console.error('Upload avatar failed', error)
      toast.error('上传失败')
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">个人中心</h1>
        <p className="mt-1 text-sm text-zinc-500 text-pretty">管理您的账户信息和安全设置</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Basic Info Display */}
        <div className="space-y-6 lg:sticky lg:top-8 h-fit">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 group">
                <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ring-4 ring-white shadow-sm flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={getFileUrl(avatarUrl)}
                      alt={profile?.username || ''}
                      className="h-full w-full object-cover"
                    />
                  ) : profile?.avatar_url ? (
                    <img
                      src={getFileUrl(profile.avatar_url)}
                      alt={profile.username || ''}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white uppercase">
                      {profile?.username?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                {/* Upload Overlay */}
                {!isUploading && (
                  <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={onAvatarUpload}
                      disabled={isUploading}
                    />
                    <Camera className="h-5 w-5" />
                  </label>
                )}
                {/* Upload Loading Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/60">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-col items-center gap-2">
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  已激活
                </div>
                {profile?.level && <PointBadge level={profile.level} size="sm" />}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-6">
              <div
                className="rounded-xl bg-indigo-50/50 p-3 text-center transition-all hover:bg-indigo-100/50 cursor-pointer group"
                onClick={() => navigate('/member/profile/points')}
              >
                <div className="flex justify-center mb-1">
                  <Coins className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] text-zinc-500 font-medium">账户积分</p>
                <p className="text-lg font-bold text-indigo-700">{profile?.points || 0}</p>
              </div>
              <div className="rounded-xl bg-amber-50/50 p-3 text-center">
                <div className="flex justify-center mb-1">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-[10px] text-zinc-500 font-medium">成长等级</p>
                <p className="text-sm font-bold text-amber-700 uppercase">
                  {profile?.level || 'BRONZE'}
                </p>
              </div>
            </div>

            {profile?.next_level_threshold && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    晋级进度
                  </p>
                  <p className="text-[10px] font-bold text-amber-700">
                    还需 ¥
                    {(Number(profile.next_level_threshold) - Number(profile.total_spent)).toFixed(
                      2,
                    )}
                  </p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, (Number(profile.total_spent) / Number(profile.next_level_threshold)) * 100)}%`,
                    }}
                    className="h-full bg-amber-400"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 text-center">
                  继续消费以解锁{' '}
                  <span className="font-semibold text-zinc-600">{profile.next_level_name}</span>{' '}
                  特权
                </p>
              </div>
            )}

            <div className="mt-8 space-y-4 border-t border-zinc-100 pt-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="rounded-lg bg-zinc-50 p-2">
                  <User className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <p className="text-zinc-400">用户名</p>
                  <p className="font-medium text-zinc-900">{profile?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="rounded-lg bg-zinc-50 p-2">
                  <Mail className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <p className="text-zinc-400">电子邮箱</p>
                  <p className="font-medium text-zinc-900">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="rounded-lg bg-zinc-50 p-2">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <p className="text-zinc-400">加入时间</p>
                  <p className="font-medium text-zinc-900">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Main Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Edit Form */}
          <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              <h3 className="font-semibold text-zinc-900">基本资料</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">用户名</label>
                  <div className="relative">
                    <input
                      {...register('username')}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      placeholder="取个好听的名字吧"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 font-medium italic">
                      <AlertCircle className="w-3 h-3" /> {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">电子邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      {...register('email')}
                      className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      placeholder="yourname@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 font-medium italic">
                      <AlertCircle className="w-3 h-3" /> {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end border-t border-zinc-100 pt-6">
                <button
                  type="submit"
                  disabled={!isDirty || updating}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  保存更改
                </button>
              </div>
            </form>
          </section>

          {/* Address Management Link */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md group">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">收货地址</h3>
                <p className="text-sm text-zinc-500">管理您的收货地址，提升下单效率</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/member/profile/addresses')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              去管理
            </button>
          </section>

          {/* My Posts Management */}
          <section className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600 transition-colors group-hover:bg-purple-100">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">我的发布</h3>
                <p className="text-sm text-zinc-500">管理您在各话题圈发布的帖子和讨论</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/member/profile/posts')}
              className="text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              查看我的帖子
            </button>
          </section>

          {/* Points History management */}
          <section className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-orange-50 p-3 text-orange-600 transition-colors group-hover:bg-orange-100">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">积分明细</h3>
                <p className="text-sm text-zinc-500">查看您的积分获取和使用记录</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/member/profile/points')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              查看明细
              <ChevronRight className="w-4 h-4" />
            </button>
          </section>

          {/* Coupons Management */}
          <section className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-rose-50 p-3 text-rose-600 transition-colors group-hover:bg-rose-100">
                <Ticket className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">我的优惠券</h3>
                <p className="text-sm text-zinc-500">管理您领取的优惠券，下单更优惠</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/member/profile/coupons')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700"
            >
              查看优惠券
              <ChevronRight className="w-4 h-4" />
            </button>
          </section>

          {/* Account Security */}
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
      </div>
    </motion.div>
  )
}
