import React from 'react'
import { Lock } from 'lucide-react'

function SandboxSelector({ sandboxes, selectedSandbox, onChangeSandbox }) {
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-[#8b949e]" size={15} />
      <select
        value={selectedSandbox || ''}
        onChange={(e) => onChangeSandbox(e.target.value)}
        className="h-9 w-full appearance-none rounded-md border border-zinc-300 bg-white pl-9 pr-8 text-sm font-medium text-zinc-900 transition-colors focus:border-[#0969da] focus:outline-none focus:ring-2 focus:ring-[#0969da]/20 dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc] dark:focus:border-[#58a6ff]"
      >
        {(!sandboxes || sandboxes.length === 0) ? (
          <option value="DefaultBox">DefaultBox</option>
        ) : (
          sandboxes.map((sandbox) => (
            <option key={sandbox} value={sandbox}>
              {sandbox === '__ask__' ? `${sandbox} (运行时询问)` : sandbox}
            </option>
          ))
        )}
      </select>
    </div>
  )
}

export default SandboxSelector
