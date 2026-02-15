import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Loader2, PackageSearch } from 'lucide-react'
import { productService } from '@/features/product/service'
import type { ProductPublicOut } from '@/features/product/types'
import { useDebounce } from '@/hooks/useDebounce'
import { getFileUrl } from '@/shared/utils/file'

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const keywordFromUrl = searchParams.get('keyword') || ''

  const [products, setProducts] = useState<ProductPublicOut[]>([])
  const [loading, setLoading] = useState(true)
  type SortOption = 'newest' | 'price_asc' | 'price_desc'
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [keyword, setKeyword] = useState(keywordFromUrl)
  const [prevKeywordFromUrl, setPrevKeywordFromUrl] = useState(keywordFromUrl)

  // 同步 URL 关键词到本地状态
  if (keywordFromUrl !== prevKeywordFromUrl) {
    setPrevKeywordFromUrl(keywordFromUrl)
    setKeyword(keywordFromUrl)
  }

  const debouncedKeyword = useDebounce(keyword, 500)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await productService.getPublicList({
          page: 1,
          page_size: 20,
          keyword: debouncedKeyword,
          sort_by: sortBy,
        })
        setProducts(res.items)
      } catch (error) {
        console.error('Failed to fetch products', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [debouncedKeyword, sortBy])

  return (
    <div className="mx-auto max-w-7xl px-4 pt-2 pb-16 sm:px-6 lg:px-8">
      {/* Filter & Sort Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-zinc-900">
          {keywordFromUrl ? `"${keywordFromUrl}" 的搜索结果` : '精选商品'}
        </h2>

        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 text-sm font-medium text-zinc-700 outline-none transition-all hover:border-zinc-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="newest">最新上架</option>
              <option value="price_asc">价格从低到高</option>
              <option value="price_desc">价格从高到低</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-zinc-50 p-4">
            <PackageSearch className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900">暂无商品</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {keywordFromUrl ? '换个关键词试试看？' : '商家正在努力上货中...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-4 gap-x-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 xl:gap-x-4">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/member/product/${product.id}`}
              className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-zinc-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="aspect-square w-full overflow-hidden bg-zinc-100">
                {product.image_url ? (
                  <img
                    src={getFileUrl(product.image_url)}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-300">
                    <PackageSearch size={24} />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-2">
                <h3 className="text-xs font-medium text-zinc-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {product.name}
                </h3>
                <p className="mt-0.5 text-[10px] text-zinc-500 line-clamp-1">
                  {product.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-zinc-900">
                    ¥{Number(product.price).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-zinc-400">{product.sales_count}人付款</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
