import { type LucideIcon, Medal, Shield, Star, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/utils/cn'

interface PointBadgeProps {
  level: string
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const levelConfig: Record<
  string,
  {
    icon: LucideIcon
    label: string
    color: string
    bg: string
    border: string
    glow: string
  }
> = {
  bronze: {
    icon: Shield,
    label: '青铜',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    glow: 'shadow-amber-500/10',
  },
  silver: {
    icon: Medal,
    label: '白银',
    color: 'text-zinc-600',
    bg: 'bg-zinc-50',
    border: 'border-zinc-200',
    glow: 'shadow-zinc-500/10',
  },
  gold: {
    icon: Star,
    label: '黄金',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    glow: 'shadow-yellow-500/10',
  },
  platinum: {
    icon: Trophy,
    label: '铂金',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    glow: 'shadow-indigo-500/10',
  },
}

export default function PointBadge({
  level,
  className,
  showText = true,
  size = 'md',
}: PointBadgeProps) {
  const config = levelConfig[level.toLowerCase()] || levelConfig.bronze
  const Icon = config.icon

  const sizeClasses = {
    sm: 'p-1 px-1.5 text-[10px] gap-1',
    md: 'p-1.5 px-3 text-xs gap-1.5',
    lg: 'p-2 px-4 text-sm gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center rounded-full border shadow-sm transition-all',
        config.bg,
        config.color,
        config.border,
        config.glow,
        sizeClasses[size],
        className,
      )}
    >
      <Icon className={cn(iconSizes[size])} />
      {showText && <span className="font-bold tracking-tight">{config.label}</span>}
    </motion.div>
  )
}
