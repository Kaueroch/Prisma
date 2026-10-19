import React, { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

type ToastVariant = 'success' | 'error'

interface ToastContextType {
  showToast: (message: string) => void
  showError: (message: string) => void
}

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, variant: 'success' as ToastVariant }])
    setTimeout(() => removeToast(id), 3000)
  }, [removeToast])

  const showError = useCallback((message: string) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, variant: 'error' as ToastVariant }])
    setTimeout(() => removeToast(id), 6000)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast, showError }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              role="alert"
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg ${
                toast.variant === 'error'
                  ? 'border-destructive/50 bg-destructive/10'
                  : 'border-border bg-card'
              }`}
            >
              {toast.variant === 'error' ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-data" />
              )}
              <span className="font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
