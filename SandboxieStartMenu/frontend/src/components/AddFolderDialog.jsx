import React from 'react'
import { Folder, FolderPlus, X } from 'lucide-react'
import { Button, IconButton } from './ui'

function AddFolderDialog({ sandboxFolders, onManualSelect, onSelectSandboxFolder, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-2xl dark:border-[#30363d] dark:bg-[#161b22]">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 dark:border-[#30363d]">
          <div>
            <h2 className="text-base font-semibold text-zinc-950 dark:text-[#f0f6fc]">添加文件夹</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-[#8b949e]">选择沙盒目录，或手动浏览本机文件夹。</p>
          </div>
          <IconButton label="关闭" onClick={onClose} className="h-8 w-8">
            <X size={16} />
          </IconButton>
        </div>

        <div className="space-y-5 p-5">
          <button
            onClick={onManualSelect}
            className="flex w-full items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition-colors hover:border-[#0969da]/40 hover:bg-[#ddf4ff] dark:border-[#30363d] dark:bg-[#0d1117] dark:hover:border-[#58a6ff]/40 dark:hover:bg-[#1f6feb26]"
          >
            <span>
              <span className="block text-sm font-semibold text-zinc-950 dark:text-[#f0f6fc]">手动选择文件夹</span>
              <span className="mt-1 block text-xs text-zinc-500 dark:text-[#8b949e]">打开系统文件夹选择窗口</span>
            </span>
            <FolderPlus className="text-[#0969da] dark:text-[#58a6ff]" size={20} />
          </button>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-[#8b949e]">现有沙盒文件夹</h3>
            {sandboxFolders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-[#30363d] dark:text-[#8b949e]">
                没有可添加的沙盒文件夹
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto rounded-lg border border-zinc-200 dark:border-[#30363d]">
                {sandboxFolders.map((folder) => (
                  <button
                    key={`${folder.sandbox}:${folder.path}`}
                    onClick={() => onSelectSandboxFolder(folder.path)}
                    className="flex w-full items-start gap-3 border-b border-zinc-200 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-[#30363d] dark:hover:bg-[#21262d]"
                  >
                    <Folder className="mt-0.5 flex-shrink-0 text-zinc-500 dark:text-[#8b949e]" size={17} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-zinc-950 dark:text-[#f0f6fc]">{folder.sandbox}</span>
                      <span className="mt-1 block break-all text-xs text-zinc-500 dark:text-[#8b949e]">{folder.path}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-[#30363d] dark:bg-[#0d1117]">
          <Button variant="secondary" onClick={onClose}>取消</Button>
        </div>
      </div>
    </div>
  )
}

export default AddFolderDialog
