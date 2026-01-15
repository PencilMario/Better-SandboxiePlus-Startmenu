import React from 'react'

function Toast({ message, type = 'success' }) {
  const bgColor = type === 'error' ? 'bg-red-500 dark:bg-red-600' : 'bg-green-500 dark:bg-green-600'
  const icon = type === 'error' ? '❌' : '✅'

  return (
    <div className={`fixed bottom-6 right-6 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up`}>
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{message}</span>
    </div>
  )
}

export default Toast
