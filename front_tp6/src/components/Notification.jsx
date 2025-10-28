import React, { useEffect } from 'react'

const Notification = ({ message, tone = 'success', onDismiss, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return
    const id = setTimeout(() => onDismiss?.(), duration)
    return () => clearTimeout(id)
  }, [message, duration, onDismiss])

  if (!message) {
    return null
  }

  const toneStyles = {
    success: 'border-success/30 bg-success/10 text-success',
    danger: 'border-danger/30 bg-danger/10 text-danger',
    info: 'border-primary-300 bg-primary-50 text-primary-700'
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-40 flex justify-center px-4">
      <div
        className={`pointer-events-auto flex max-w-xl items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-medium shadow-lg ${
          toneStyles[tone] ?? toneStyles.info
        }`}
      >
        <span>{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto rounded-full border border-transparent px-2 py-1 text-xs uppercase tracking-wider text-current transition hover:border-current"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

export default Notification
