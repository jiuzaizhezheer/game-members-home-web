import { reportApi } from './api'
import type { ReportCreateIn } from './types'

export const reportService = {
  async create(data: ReportCreateIn) {
    return await reportApi.create(data)
  },
}
