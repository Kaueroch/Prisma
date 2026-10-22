import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { DURATION, EASE } from '../motion/tokens'

type ToastVariant = 'success' | 'error'

interface ToastContextType {
  showToast: (message: string) => void
  showError: (message: string) => void
}

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
  /** Duração total em ms antes do auto-dismiss. */
  duration: number
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

/**
 * Conteúdo do toast: barra de progresso, pausa no hover e dismiss por clique.
 *
 * Fica separado do wrapper `motion.div` (que é quem carrega a `key` da lista)
 * porque este projeto não tem `@types/react` instalado — e o `key` em
 * componentes de função locais não passa no typecheck.
 */
function ToastContent({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const reduce = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const remaining = useRef(toast.duration)
  const startedAt = useRef(0)

  // Auto-dismiss: o tempo só corre quando o toast não está pausado.
  useEffect(() => {
    if (paused) {
      // Ao pausar, desconta o tempo já decorrido.
      remaining.current -= performance.now() - startedAt.current
      return
    }
    startedAt.current = performance.now()
    const timer = setTimeout(() => onDismiss(toast.id), Math.max(0, remaining.current))
    return () => clearTimeout(timer)
  }, [paused, toast.id, onDismiss])

  return (
    <div
      role="alert"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={() => onDismiss(toast.id)}
      className={`relative w-72 cursor-pointer overflow-hidden rounded-xl border px-4 py-3 text-sm shadow-lg ${
        toast.variant === 'error'
          ? 'border-destructive/50 bg-destructive/10'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {toast.variant === 'error' ? (
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
        ) : (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-positive" />
        )}
        <span className="font-medium">{toast.message}</span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDismiss(toast.id) }}
          aria-label="Fechar aviso"
          className="ml-auto shrink-0 text-fg-subtle transition-colors hover:text-fg"
        >
          <X className="size-3.5" />
        </button>
      </div>
      {/* Barra de progresso do auto-dismiss. */}
      {!reduce && (
        <motion.span
          key={paused ? 'paused' : 'running'}
          className={`absolute bottom-0 left-0 h-0.5 ${toast.variant === 'error' ? 'bg-destructive' : 'bg-positive'}`}
          initial={{ width: '100%' }}
          animate={{ width: paused ? '100%' : '0%' }}
          transition={{ duration: paused ? 0 : toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const reduce = useReducedMotion()

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((message: string, variant: ToastVariant, duration: number) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, variant, duration }])
  }, [])

  const showToast = useCallback((message: string) => push(message, 'success', 3000), [push])
  const showError = useCallback((message: string) => push(message, 'error', 6000), [push])

  return (
    <ToastContext.Provider value={{ showToast, showError }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.95 }}
              transition={{ duration: reduce ? 0 : DURATION.base, ease: EASE }}
            >
              <ToastContent toast={toast} onDismiss={removeToast} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
