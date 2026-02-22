import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { getFileUrl } from '@/shared/utils/file'

interface ImageViewerProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onClose: () => void
}

export default function ImageViewer({ images, initialIndex = 0, open, onClose }: ImageViewerProps) {
  if (!open) return null
  return (
    <ImageViewerPortal images={images} initialIndex={initialIndex} onClose={onClose} open={open} />
  )
}

type ImageViewerPortalProps = Omit<ImageViewerProps, 'initialIndex'> & { initialIndex: number }

function ImageViewerPortal({ images, initialIndex, onClose, open }: ImageViewerPortalProps) {
  const [index, setIndex] = useState<number>(initialIndex)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handlePrev = useCallback(() => {
    setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }, [images.length])

  const handleNext = useCallback(() => {
    setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }, [images.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, handlePrev, handleNext])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Controls */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 text-white z-50">
            <div className="texy-sm font-medium">
              {index + 1} / {images.length}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
                className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Image */}
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative max-h-screen max-w-screen p-4 flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getFileUrl(images[index])}
              alt={`Image ${index + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-md shadow-2xl"
            />
          </motion.div>

          {/* Thumbnails (Optional, maybe for later) */}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
