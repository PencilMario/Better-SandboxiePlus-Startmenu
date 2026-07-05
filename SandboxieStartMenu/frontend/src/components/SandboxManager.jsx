import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, IconButton } from './ui'

function SandboxManager({ sandboxes, onAddSandbox, onRemoveSandbox }) {
  const [newSandboxName, setNewSandboxName] = useState('')

  const handleAddClick = () => {
    if (newSandboxName.trim()) {
      onAddSandbox(newSandboxName)
      setNewSandboxName('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddClick()
    }
  }

  return (
    <div className="space-y-3">
      <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
        {(!sandboxes || sandboxes.length === 0) ? (
          <p className="rounded-md border border-dashed border-zinc-300 px-3 py-4 text-center text-sm text-zinc-500 dark:border-[#30363d] dark:text-[#8b949e]">未添加沙盒</p>
        ) : (
          sandboxes.map((sandbox) => (
            <div
              key={sandbox}
              className="group flex items-center justify-between gap-2 rounded-md px-2 py-2 text-zinc-700 transition-colors hover:bg-zinc-200/70 dark:text-[#c9d1d9] dark:hover:bg-[#21262d]"
            >
              <span className="min-w-0 truncate text-sm font-medium">
                {sandbox === '__ask__' ? `${sandbox} (询问)` : sandbox}
              </span>
              <IconButton
                onClick={() => onRemoveSandbox(sandbox)}
                disabled={sandbox === '__ask__'}
                label={sandbox === '__ask__' ? '无法移除 __ask__ 选项' : '移除沙盒'}
                className="h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 size={14} />
              </IconButton>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2 border-t border-zinc-200 pt-3 dark:border-[#30363d]">
        <input
          type="text"
          value={newSandboxName}
          onChange={(e) => setNewSandboxName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="新沙盒名称"
          className="h-8 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da]/20 dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc] dark:placeholder:text-[#8b949e]"
        />
        <Button onClick={handleAddClick} variant="primary" size="sm">
          <Plus size={14} />
          添加
        </Button>
      </div>
    </div>
  )
}

export default SandboxManager
