import { requestJson } from '@/shared/api/http'
import type { CategoryOut } from './types'

export const categoryApi = {
  /** 获取所有分类 */
  async getAll(): Promise<CategoryOut[]> {
    return await requestJson<CategoryOut[]>('/categories/', {
      method: 'GET',
      auth: false,
    })
  },
}
