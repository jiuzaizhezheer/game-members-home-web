import { requestJson } from '@/shared/api/http'
import type { ReportCreateIn, ReportItemOut } from './types'

export const reportApi = {
  create: (data: ReportCreateIn) =>
    requestJson<ReportItemOut>('/reports/', {
      method: 'POST',
      body: data,
    }),
}
