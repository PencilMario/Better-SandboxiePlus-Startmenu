import React from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

function Toast({ message, type = 'success' }) {
  const isError = type === 'error'
  const Icon = isError ? AlertCircle : CheckCircle

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-2xl animate-fade-in-up ${
      isError
        ? 'border-[#f85149]/40 bg-white text-[#cf222e] dark:bg-[#161b22] dark:text-[#f85149]'
        : 'border-[#2ea043]/30 bg-white text-[#1a7f37] dark:bg-[#161b22] dark:text-[#3fb950]'
    }`}>
      <Icon size={18} className="flex-shrink-0" />
      <span className="font-medium text-zinc-900 dark:text-[#f0f6fc]">{message}</span>
    </div>
  )
}

export default Toast
