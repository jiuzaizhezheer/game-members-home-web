/**
 * 图片处理工具函数
 */

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // 避免跨域 Canvas 错误
    image.src = url
  })

/**
 * 获取裁剪后的图片 Blob
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<Blob | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // 设置 canvas 尺寸为裁剪尺寸
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // 绘制裁剪图片
  // 使用 drawImage 的 9 参数版本进行精确切片
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  // 返回 Blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (file) => {
        resolve(file)
      },
      'image/jpeg',
      0.95,
    ) // 保持高质量
  })
}
