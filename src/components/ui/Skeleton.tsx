/**
 * Skeleton — 骨架屏占位组件
 *
 * 使用方式：
 *   <Skeleton className="h-48 w-full rounded-2xl" />
 *
 * 预设组合：
 *   <Skeleton.ProductCard />
 *   <Skeleton.PostCard />
 *   <Skeleton.Text lines={3} />
 */

interface SkeletonProps {
  className?: string
}

function Base({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-zinc-100 ${className}`} aria-hidden="true" />
}

/** 商品卡片骨架 */
function ProductCard() {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 space-y-3">
      <Base className="aspect-square w-full rounded-xl" />
      <Base className="h-4 w-3/4" />
      <Base className="h-3 w-1/2" />
      <div className="flex justify-between items-center pt-1">
        <Base className="h-5 w-1/3" />
        <Base className="h-8 w-8 rounded-full" />
      </div>
    </div>
  )
}

/** 帖子卡片骨架 */
function PostCard() {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 space-y-3">
      <div className="flex items-center gap-3">
        <Base className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Base className="h-3 w-1/4" />
          <Base className="h-3 w-1/3" />
        </div>
      </div>
      <Base className="h-5 w-2/3" />
      <Base className="h-3 w-full" />
      <Base className="h-3 w-4/5" />
      <div className="flex gap-4 pt-2">
        <Base className="h-3 w-12" />
        <Base className="h-3 w-12" />
        <Base className="h-3 w-12" />
      </div>
    </div>
  )
}

/** 多行文字骨架 */
function Text({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Base key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}

/** 商品列表/首页骨架屏 */
function ProductGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCard key={i} />
      ))}
    </div>
  )
}

/** 帖子列表骨架屏 */
function PostList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostCard key={i} />
      ))}
    </div>
  )
}

const Skeleton = Object.assign(Base, {
  ProductCard,
  PostCard,
  Text,
  ProductGrid,
  PostList,
})

export default Skeleton
