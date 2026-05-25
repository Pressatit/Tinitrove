import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '@/stores/toaststore'

// Icon and color config per toast type
const STYLES = {
  success: {
    Icon: CheckCircle,
    container: 'bg-white border border-green-100 shadow-lg shadow-green-100/30',
    icon: 'text-green-500',
    text: 'text-brand-charcoal',
  },
  error: {
    Icon: XCircle,
    container: 'bg-white border border-red-100 shadow-lg shadow-red-100/30',
    icon: 'text-red-400',
    text: 'text-brand-charcoal',
  },
  info: {
    Icon: Info,
    container: 'bg-white border border-pink-100 shadow-lg shadow-pink-100/30',
    icon: 'text-brand-pink',
    text: 'text-brand-charcoal',
  },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    // Fixed to top-right on desktop, top-centre on mobile
    // z-[100] so it floats above the drawer (z-50) and everything else
    <div className="
      fixed z-[100] flex flex-col gap-2 pointer-events-none
      top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm
      lg:top-5 lg:right-5 lg:left-auto lg:translate-x-0 lg:w-auto lg:min-w-[280px]
    ">
      <AnimatePresence>
        {toasts.map(toast => {
          const { Icon, container, icon, text } = STYLES[toast.type]

          return (
            <motion.div
              key={toast.id}
              // Slides down from top and fades in
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,   scale: 1    }}
              exit={{    opacity: 0, y: -8,   scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl
                pointer-events-auto
                ${container}
              `}
            >
              <Icon size={18} strokeWidth={2} className={`shrink-0 ${icon}`} />

              <p className={`text-sm font-medium flex-1 ${text}`}>
                {toast.message}
              </p>

              {/* Manual dismiss button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-brand-muted hover:text-brand-charcoal transition-colors -mr-1"
                aria-label="Dismiss"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}