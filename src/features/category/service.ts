import { categoryApi } from '@/features/category/api'
import type { CategoryOut } from './types'

/** 分类服务 */
export const categoryService = {
  /** 获取所有分类 */
  async getAll(): Promise<CategoryOut[]> {
    return await categoryApi.getAll()
  },
}
