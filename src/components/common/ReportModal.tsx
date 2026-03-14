import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flag, Loader2, Upload, X } from 'lucide-react'

import { commonApi } from '@/features/common/api'
import { reportService } from '@/features/report/service'
import type { ReportTargetType } from '@/features/report/types'
import { getFileUrl } from '@/shared/utils/file'

type ReportReason = {
  value: string
  label: string
}

const REASONS: ReportReason[] = [
  { value: 'spam', label: '垃圾广告' },
  { value: 'abuse', label: '辱骂攻击' },
  { value: 'porn', label: '色情低俗' },
  { value: 'illegal', label: '违法违规' },
  { value: 'fraud', label: '诈骗信息' },
  { value: 'other', label: '其他' },
]

export default function ReportModal({
  open,
  onClose,
  targetType,
  targetId,
}: {
  open: boolean
  onClose: () => void
  targetType: ReportTargetType
  targetId: string
}) {
  const [reason, setReason] = useState(REASONS[0]?.value ?? 'other')
  const [description, setDescription] = useState('')
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const title = useMemo(() => {
    if (targetType === 'post') return '举报帖子'
    if (targetType === 'comment') return '举报评论'
    return '举报商品'
  }, [targetType])

  const handleClose = () => {
    setReason(REASONS[0]?.value ?? 'other')
    setDescription('')
    setEvidenceUrls([])
    setSubmitting(false)
    setUploading(false)
    onClose()
  }

  const handleUpload = async (file: File) => {
    if (uploading) return
    setUploading(true)
    try {
      const { url } = await commonApi.uploadFile(file)
      setEvidenceUrls((prev) => (prev.includes(url) ? prev : [...prev, url]))
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await reportService.create({
        target_type: targetType,
        target_id: targetId,
        reason,
        description: description.trim() ? description.trim() : null,
        evidence_urls: evidenceUrls,
      })
      handleClose()
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && handleClose()}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <Flag size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
                  <p className="text-xs text-zinc-400">ID: {targetId.slice(0, 12)}...</p>
                </div>
              </div>
              <button
                onClick={() => !submitting && handleClose()}
                className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">举报原因</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">补充说明（可选）</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="请简要描述问题（最多 2000 字）"
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700">证据图片（可选）</label>
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50">
                    {uploading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    上传
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) void handleUpload(file)
                        e.currentTarget.value = ''
                      }}
                      disabled={uploading || submitting}
                    />
                  </label>
                </div>

                {evidenceUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {evidenceUrls.map((url) => (
                      <div
                        key={url}
                        className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
                      >
                        <img src={getFileUrl(url)} className="h-16 w-full object-cover" />
                        <button
                          onClick={() => setEvidenceUrls((prev) => prev.filter((u) => u !== url))}
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          disabled={submitting}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => !submitting && handleClose()}
                  disabled={submitting}
                  className="flex-1 rounded-full border border-zinc-200 py-2.5 text-sm font-bold text-zinc-500 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || uploading}
                  className="flex-1 rounded-full bg-rose-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={18} className="mx-auto animate-spin" /> : '提交举报'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
