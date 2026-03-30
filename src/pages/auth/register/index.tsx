import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Mail,
  Lock,
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
  EyeOff,
  User,
  KeyRound,
  RefreshCw,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { authService } from '@/features/auth/service'
import { ROLE_ICONS, ROLE_OPTIONS } from '@/features/auth/constants'
import { useClickOutside } from '@/hooks/useClickOutside'
import { AuthRegisterSchema, type AuthRegisterIn, type Role } from '@/features/auth/types'

/**
 * 注册页面组件
 */
export default function RegisterPage() {
  /** 导航 */
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // 从 URL 获取 role 参数，禁止注册管理员
  const urlRole = searchParams.get('role') as Role | null
  const defaultRole: Role = urlRole && ['member', 'merchant'].includes(urlRole) ? urlRole : 'member'

  // ==================== 引用 (Refs) ====================
  /** 下拉框容器引用 */
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ==================== React Hook Form ====================
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<AuthRegisterIn>({
    resolver: zodResolver(AuthRegisterSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: defaultRole,
      captcha_id: '',
      image_captcha_code: '',
      captcha_code: '',
    },
  })

  // 角色状态 (手动管理以避免 watch 导致的 React Compiler 警告)
  const [role, setRole] = useState<Role>(defaultRole)

  // ==================== UI 状态 ====================
  /** 验证码图片 (Base64) */
  const [captchaImage, setCaptchaImage] = useState('')
  /** 是否正在加载验证码 */
  const [captchaLoading, setCaptchaLoading] = useState(false)
  /** 下拉框是否开启 */
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  /** 密码是否可见 */
  const [showPassword, setShowPassword] = useState(false)
  /** 是否已发送邮件验证码 */
  const [isEmailSent, setIsEmailSent] = useState(false)
  /** 倒计时 */
  const [countdown, setCountdown] = useState(0)
  /** 图置验证码请求状态 */
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // 倒计时逻辑
  useEffect(() => {
    let timer: number | undefined
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  // 自定义角色图标组件
  const RoleIcon = ROLE_ICONS[role]

  // 处理点击外部关闭下拉框
  useClickOutside(dropdownRef, () => setIsSelectOpen(false))

  /**
   * 获取验证码
   */
  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    try {
      const data = await authService.getCaptcha()
      // 注意：初始获取的是图形验证码的 ID
      setValue('captcha_id', data.id)
      setCaptchaImage(data.image)
      setValue('image_captcha_code', '') // 刷新后清空输入
    } catch (err) {
      console.error('Failed to fetch captcha:', err)
    } finally {
      setCaptchaLoading(false)
    }
  }, [setValue])

  /**
   * 发送邮件验证码
   */
  const handleSendEmail = async () => {
    const { email, captcha_id, image_captcha_code } = getValues()

    if (!email || !captcha_id || !image_captcha_code) {
      // 触发 RHF 的校验
      trigger(['email', 'image_captcha_code'])
      return
    }

    setIsSendingEmail(true)
    try {
      const data = await authService.sendEmailCaptcha({
        email,
        image_captcha_id: captcha_id,
        image_captcha_code,
      })
      // 发送成功后，更新 captcha_id 为邮件验证码 ID
      setValue('captcha_id', data.id)
      setIsEmailSent(true)
      setCountdown(60)
    } catch (err) {
      console.error('Failed to send email captcha:', err)
      // 发送失败需刷新图形验证码
      fetchCaptcha()
    } finally {
      setIsSendingEmail(false)
    }
  }

  /**
   * 处理注册表单提交
   */
  async function handleRegister(data: AuthRegisterIn) {
    try {
      await authService.register(data)
      navigate(`/auth/login?role=${data.role}`, {
        state: { email: data.email, password: data.password },
      })
    } catch (err) {
      console.error('Register failed:', err)
      // 注册失败通常需要刷新验证码
      fetchCaptcha()
    }
  }

  return (
    <div className="my-5">
      {/* 顶部标题 */}
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">创建新账号</h1>
      </div>

      {/* 注册卡片主体 */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-card-lg ring-1 ring-black/5">
        {/* 顶部装饰性渐变条 */}
        <div className="h-1.5 w-full bg-primary-gradient" />

        <div className="p-5">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-zinc-900">账号注册</h2>
            <p className="mt-1 text-sm text-zinc-500">请填写以下信息完成注册</p>
          </div>

          <form onSubmit={handleSubmit(handleRegister)} className="space-y-3" autoComplete="off">
            {/* 角色选择 */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-700">当前身份</div>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className={`flex h-11 w-full items-center justify-between rounded-xl bg-zinc-50 px-5 text-sm text-zinc-900 transition-all focus:ring-2 focus:ring-indigo-500/20 ring-1 ring-black/5 ${isSelectOpen ? 'ring-2 ring-indigo-500/20' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm ring-1 ring-black/5">
                      <RoleIcon size={20} className="text-indigo-600" />
                    </div>
                    <span className="font-medium">
                      {ROLE_OPTIONS.find((opt) => opt.value === role)?.label}
                    </span>
                  </div>
                  <div className="text-zinc-400">
                    {isSelectOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* 下拉菜单 */}
                {isSelectOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-100 bg-white p-1 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                    <div className="max-h-60 overflow-y-auto">
                      {ROLE_OPTIONS.filter((opt) => opt.value !== 'admin').map((option) => {
                        const Icon = option.icon
                        const isActive = role === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setValue('role', option.value as Role)
                              setRole(option.value as Role)
                              setIsSelectOpen(false)
                            }}
                            className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 ${
                              isActive
                                ? 'bg-indigo-50/80 text-indigo-700 shadow-sm'
                                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-md'
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                                isActive
                                  ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-indigo-100'
                                  : 'bg-zinc-100 text-zinc-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-zinc-600 group-hover:ring-1 group-hover:ring-zinc-200'
                              }`}
                            >
                              <Icon size={20} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <span
                                className={`block font-semibold ${isActive ? 'text-indigo-900' : 'text-zinc-600 group-hover:text-zinc-900'}`}
                              >
                                {option.label}
                              </span>
                              <span
                                className={`block truncate text-[11px] leading-tight ${isActive ? 'text-indigo-500' : 'text-zinc-400 group-hover:text-zinc-500'}`}
                              >
                                {option.desc}
                              </span>
                            </div>
                            {isActive && <Check size={20} className="text-indigo-600 shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 用户名输入 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-zinc-700">用户名</div>
                {errors.username && (
                  <span className="text-xs text-rose-500">{errors.username.message}</span>
                )}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                  <User size={20} />
                </div>
                <input
                  {...register('username')}
                  type="text"
                  autoComplete="off"
                  placeholder="请输入用户名"
                  className={`h-10 w-full rounded-xl bg-zinc-50 pl-12 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 ring-1 ${errors.username ? 'ring-rose-200 focus:ring-rose-500/20' : 'ring-black/5'}`}
                />
              </div>
            </div>

            {/* 邮箱输入 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-zinc-700">邮箱</div>
                {errors.email && (
                  <span className="text-xs text-rose-500">{errors.email.message}</span>
                )}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                  <Mail size={20} />
                </div>
                <input
                  {...register('email')}
                  type="text"
                  autoComplete="off"
                  placeholder="请输入您的邮箱"
                  className={`h-10 w-full rounded-xl bg-zinc-50 pl-12 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 ring-1 ${errors.email ? 'ring-rose-200 focus:ring-rose-500/20' : 'ring-black/5'}`}
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-zinc-700">密码</div>
                {errors.password && (
                  <span className="text-xs text-rose-500">{errors.password.message}</span>
                )}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                  <Lock size={20} />
                </div>
                <input
                  {...register('password')}
                  type="text"
                  autoComplete="off"
                  style={
                    { WebkitTextSecurity: showPassword ? 'none' : 'disc' } as React.CSSProperties
                  }
                  placeholder="请输入您的密码"
                  className={`h-10 w-full rounded-xl bg-zinc-50 pl-12 pr-12 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 ring-1 ${errors.password ? 'ring-rose-200 focus:ring-rose-500/20' : 'ring-black/5'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {/* 验证码区域：双重验证逻辑 */}
            {!isEmailSent ? (
              /* 第一阶段：填写图形验证码并发送邮件 */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-zinc-700">图形验证码</div>
                  {errors.image_captcha_code && (
                    <span className="text-xs text-rose-500">
                      {errors.image_captcha_code.message}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                      <KeyRound size={20} />
                    </div>
                    <input
                      {...register('image_captcha_code')}
                      type="text"
                      autoComplete="off"
                      maxLength={6}
                      placeholder="图中的文字"
                      className={`h-10 w-full rounded-xl bg-zinc-50 pl-12 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 ring-1 ${errors.image_captcha_code ? 'ring-rose-200 focus:ring-rose-500/20' : 'ring-black/5'}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    disabled={captchaLoading}
                    className="group relative flex h-10 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-black/5 transition-all hover:bg-zinc-100 active:scale-95 disabled:opacity-50"
                  >
                    {captchaLoading ? (
                      <RefreshCw size={20} className="animate-spin text-zinc-400" />
                    ) : captchaImage ? (
                      <img
                        src={captchaImage}
                        alt="captcha"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs">获取中...</span>
                    )}
                  </button>
                </div>
                {/* 发送邮件按钮 */}
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white text-sm font-medium text-zinc-600 transition-all hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Mail size={16} />
                  )}
                  获取邮件验证码
                </button>
              </div>
            ) : (
              /* 第二阶段：填写邮件中的 6 位验证码 */
              <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-zinc-700">邮件验证码</div>
                  {errors.captcha_code && (
                    <span className="text-xs text-rose-500">{errors.captcha_code.message}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                      <KeyRound size={20} />
                    </div>
                    <input
                      {...register('captcha_code')}
                      type="text"
                      autoComplete="off"
                      maxLength={6}
                      placeholder="邮件中的6位数字"
                      className={`h-10 w-full rounded-xl bg-zinc-50 pl-12 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 ring-1 ${errors.captcha_code ? 'ring-rose-200 focus:ring-rose-500/20' : 'ring-black/5'}`}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={countdown > 0 || isSendingEmail}
                    onClick={() => {
                      setIsEmailSent(false)
                      fetchCaptcha()
                    }}
                    className="flex h-10 px-4 items-center justify-center rounded-xl bg-zinc-50 text-xs font-medium text-zinc-500 ring-1 ring-black/5 hover:bg-zinc-100 disabled:text-zinc-400"
                  >
                    {countdown > 0 ? `${countdown}s 后重新发送` : '重新获取'}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 ml-1">
                  验证码已发至您的邮箱，请在 5 分钟内完成填写
                </p>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-full bg-zinc-900 text-base font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '注册中...' : '注册'}
              </button>
            </div>

            {/* 跳转登录 */}
            <div className="pt-1 text-center text-sm">
              <span className="text-zinc-500">已有账号？</span>{' '}
              <button
                type="button"
                onClick={() => navigate(`/auth/login?role=${role}`)}
                className="font-semibold text-indigo-600 hover:underline"
              >
                返回登录
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
