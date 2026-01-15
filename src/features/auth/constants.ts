import { User, Store, ShieldCheck, type LucideIcon } from 'lucide-react'
import type { Role } from './types'

/** 角色图标映射 */
export const ROLE_ICONS: Record<Role, LucideIcon> = {
  member: User,
  merchant: Store,
  admin: ShieldCheck,
}

/** 角色选项类型定义 */
export interface RoleOption {
  value: Role
  label: string
  icon: LucideIcon
  desc: string
}

/** 角色选项配置 */
export const ROLE_OPTIONS: RoleOption[] = [
  { value: 'member', label: '普通用户', icon: User, desc: '浏览游戏资讯与周边' },
  { value: 'merchant', label: '合作商家', icon: Store, desc: '管理店铺、发布优惠活动' },
  { value: 'admin', label: '系统管理员', icon: ShieldCheck, desc: '系统维护与全平台管理' },
]
