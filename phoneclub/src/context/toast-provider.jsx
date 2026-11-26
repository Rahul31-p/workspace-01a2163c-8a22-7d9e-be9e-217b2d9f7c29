import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProviderPrimitive,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { ToastContext } from './toast-context'

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const iconColors = {
  success: 'text-success',
  error: 'text-destructive',
  info: 'text-primary',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, variant = 'success', duration = 4500, action }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      setToasts((current) => [...current, { id, title, description, variant, duration, action }])
      return id
    },
    [],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      <ToastProviderPrimitive duration={4500} swipeDirection="right">
        {children}
        {toasts.map((item) => {
          const Icon = icons[item.variant] ?? Info

          return (
            <Toast
              key={item.id}
              duration={item.duration}
              onOpenChange={(open) => {
                if (!open) dismiss(item.id)
              }}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColors[item.variant] ?? 'text-primary'}`} />
              <div className="min-w-0 flex-1 pr-4">
                <ToastTitle>{item.title}</ToastTitle>
                {item.description && <ToastDescription>{item.description}</ToastDescription>}
              </div>
              {item.action?.to && (
                <ToastAction asChild altText={item.action.label}>
                  <Link to={item.action.to}>{item.action.label}</Link>
                </ToastAction>
              )}
              <ToastClose />
            </Toast>
          )
        })}
        <ToastViewport />
      </ToastProviderPrimitive>
    </ToastContext.Provider>
  )
}
