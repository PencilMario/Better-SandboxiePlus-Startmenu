import React, { useCallback, useEffect, useState } from 'react'
import { Maximize2, Minimize2, Minus, Shield, X } from 'lucide-react'
import {
  Quit,
  WindowIsMaximised,
  WindowMinimise,
  WindowToggleMaximise,
} from '../../wailsjs/runtime/runtime'
import { cx } from './ui'

function WindowButton({ label, className = '', children, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        'flex h-10 w-11 items-center justify-center text-zinc-600 transition-colors',
        'hover:bg-zinc-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0969da]',
        'dark:text-[#8b949e] dark:hover:bg-[#30363d] dark:hover:text-[#f0f6fc]',
        className
      )}
    >
      {children}
    </button>
  )
}

function TitleBar({ appState }) {
  const [isMaximised, setIsMaximised] = useState(false)

  const refreshMaximised = useCallback(async () => {
    try {
      setIsMaximised(await WindowIsMaximised())
    } catch (err) {
      console.error('Error reading window maximised state:', err)
    }
  }, [])

  useEffect(() => {
    refreshMaximised()
    window.addEventListener('resize', refreshMaximised)
    return () => window.removeEventListener('resize', refreshMaximised)
  }, [refreshMaximised])

  const handleToggleMaximise = useCallback(async () => {
    WindowToggleMaximise()
    window.setTimeout(refreshMaximised, 120)
  }, [refreshMaximised])

  const sandboxLabel = appState?.selectedSandbox === '__ask__'
    ? '运行时询问'
    : appState?.selectedSandbox || 'DefaultBox'

  return (
    <header className="flex h-10 flex-shrink-0 items-center border-b border-zinc-200 bg-white text-zinc-900 dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#c9d1d9]">
      <div
        className="flex h-full min-w-0 flex-1 items-center gap-3 px-3"
        style={{ '--wails-draggable': 'drag' }}
        onDoubleClick={handleToggleMaximise}
      >
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[#24292f] text-white dark:bg-[#238636]">
          <Shield size={14} />
        </div>
        <div className="min-w-0 leading-none">
          <p className="truncate text-xs font-semibold text-zinc-950 dark:text-[#f0f6fc]">
            Sandboxie Start Menu
          </p>
          <p className="mt-1 truncate text-[11px] text-zinc-500 dark:text-[#8b949e]">
            {sandboxLabel}
          </p>
        </div>
      </div>

      <div className="flex h-full flex-shrink-0 items-center">
        <WindowButton label="最小化" onClick={WindowMinimise}>
          <Minus size={15} />
        </WindowButton>
        <WindowButton label={isMaximised ? '还原' : '最大化'} onClick={handleToggleMaximise}>
          {isMaximised ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </WindowButton>
        <WindowButton
          label="关闭"
          onClick={Quit}
          className="hover:bg-[#cf222e] hover:text-white dark:hover:bg-[#da3633] dark:hover:text-white"
        >
          <X size={16} />
        </WindowButton>
      </div>
    </header>
  )
}

export default TitleBar
