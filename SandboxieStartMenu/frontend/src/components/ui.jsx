import React from 'react'
import { AlertCircle, X } from 'lucide-react'

export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

const buttonVariants = {
  primary: 'bg-[#238636] text-white hover:bg-[#2ea043] focus-visible:ring-[#3fb950]',
  secondary: 'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#c9d1d9] dark:hover:bg-[#30363d]',
  ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-[#8b949e] dark:hover:bg-[#21262d] dark:hover:text-[#f0f6fc]',
  danger: 'bg-[#da3633] text-white hover:bg-[#f85149] focus-visible:ring-[#f85149]',
}

const buttonSizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  icon: 'h-9 w-9 p-0',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-[#0d1117]',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function IconButton({ label, className = '', children, ...props }) {
  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label={label}
      title={label}
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
}

export function Badge({ tone = 'neutral', children, className = '' }) {
  const tones = {
    neutral: 'border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]',
    success: 'border-[#2ea043]/30 bg-[#238636]/10 text-[#1a7f37] dark:text-[#3fb950]',
    warning: 'border-[#d29922]/40 bg-[#d29922]/10 text-[#9a6700] dark:text-[#d29922]',
    danger: 'border-[#f85149]/40 bg-[#f85149]/10 text-[#cf222e] dark:text-[#f85149]',
  }

  return (
    <span className={cx('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', tones[tone], className)}>
      {children}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-sm text-center">
        {Icon && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e]">
            <Icon size={22} />
          </div>
        )}
        <h3 className="text-base font-semibold text-zinc-950 dark:text-[#f0f6fc]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-[#8b949e]">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '确认',
  cancelLabel = '取消',
  destructive = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-2xl dark:border-[#30363d] dark:bg-[#161b22]">
        <div className="flex items-start gap-3 border-b border-zinc-200 p-4 dark:border-[#30363d]">
          <div className={cx(
            'mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border',
            destructive
              ? 'border-[#f85149]/40 bg-[#f85149]/10 text-[#cf222e] dark:text-[#f85149]'
              : 'border-[#d29922]/40 bg-[#d29922]/10 text-[#9a6700] dark:text-[#d29922]'
          )}>
            <AlertCircle size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-[#f0f6fc]">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-[#8b949e]">{description}</p>
          </div>
          <IconButton label="关闭" onClick={onCancel} className="h-8 w-8">
            <X size={16} />
          </IconButton>
        </div>
        <div className="flex justify-end gap-2 bg-zinc-50 px-4 py-3 dark:bg-[#0d1117]">
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
