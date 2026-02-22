import { useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { ConfirmContext, type ConfirmOptions } from './confirmContext'

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise((resolve) => {
      setResolveRef(() => resolve)
    })
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    resolveRef?.(true)
  }

  const handleCancel = () => {
    setIsOpen(false)
    resolveRef?.(false)
  }

  const variantStyles = {
    danger: {
      icon: 'bg-rose-100 text-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
    },
    warning: {
      icon: 'bg-amber-100 text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
    },
    default: {
      icon: 'bg-indigo-100 text-indigo-600',
      button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
    },
  }

  const currentVariant = options?.variant || 'default'
  const styles = variantStyles[currentVariant]

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={handleCancel}
                className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X size={18} />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center text-center">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${styles.icon}`}
                >
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">{options.title || '确认操作'}</h3>
                <p className="mt-2 text-sm text-zinc-500">{options.description}</p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-95"
                >
                  {options.cancelText || '取消'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${styles.button}`}
                >
                  {options.confirmText || '确定'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  )
}
