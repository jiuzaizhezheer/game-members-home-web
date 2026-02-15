import { requestJson } from '@/shared/api/http'

export interface FileUploadOut {
  url: string
}

export const commonApi = {
  /**
   * 上传文件
   */
  uploadFile: async (file: File): Promise<FileUploadOut> => {
    const formData = new FormData()
    formData.append('file', file)

    return await requestJson<FileUploadOut>('/commons/upload', {
      method: 'POST',
      body: formData,
    })
  },
}
