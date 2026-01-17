import { requestJson } from '@/shared/api/http'
import type { Category } from '@/features/category/types'

export const categoryApi = {
  /** 获取所有分类 */
  async getAll(): Promise<Category[]> {
    return await requestJson<Category[]>('/categories/', {
      method: 'GET',
    })
  },
}
