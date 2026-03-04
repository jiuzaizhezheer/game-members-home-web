import { requestJson } from '@/shared/api/http'

export interface FileUploadOut {
  url: string
}

export interface BannerOut {
  id: string
  title: string
  image_url: string
  link_url: string | null
  sort_order: number
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

  /**
   * 获取轮播图
   */
  getBanners: async (): Promise<BannerOut[]> => {
    return await requestJson<BannerOut[]>('/commons/banners', {
      method: 'GET',
      auth: false,
    })
  },
}
