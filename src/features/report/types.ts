export type ReportTargetType = 'post' | 'comment' | 'product'
export type ReportStatus = 'pending' | 'handled'
export type ReportResult = 'success' | 'fail'

export interface ReportCreateIn {
  target_type: ReportTargetType
  target_id: string
  reason: string
  description?: string | null
  evidence_urls?: string[]
}

export interface ReportItemOut {
  id: string
  reporter_id: string
  target_type: ReportTargetType
  target_id: string
  reason: string
  description?: string | null
  evidence_urls: string[]
  status: ReportStatus
  result?: ReportResult | null
  handled_by?: string | null
  handled_note?: string | null
  handled_at?: string | null
  created_at: string
  updated_at: string
}
