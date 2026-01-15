import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 50 : -50,
    opacity: 0,
    filter: 'blur(8px)',
  }),
  center: {
    zIndex: 1,
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    zIndex: 0,
    y: direction < 0 ? 50 : -50,
    opacity: 0,
    filter: 'blur(8px)',
  }),
}

export default function AuthLayout() {
  const location = useLocation()

  // 判断跳转方向：如果是去注册页则视为"前进"(下到上)，否则视为"后退"(上到下)
  // 这种简单的逻辑适用于只有两个页面相互切换的场景
  const direction = location.pathname === '/register' ? 1 : -1

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-main px-4 font-sans text-zinc-900">
      {/* 背景装饰元素 - 保持固定不随页面切换移动 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      {/* 动画容器 */}
      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={location.pathname}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              y: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
