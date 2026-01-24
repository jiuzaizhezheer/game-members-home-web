import { categoryApi } from '@/features/category/api'
import type { Category } from '@/features/category/types'

/** 分类服务 */
export const categoryService = {
  /** 获取所有分类 */
  async getAll(): Promise<Category[]> {
    return await categoryApi.getAll()
  },
}
