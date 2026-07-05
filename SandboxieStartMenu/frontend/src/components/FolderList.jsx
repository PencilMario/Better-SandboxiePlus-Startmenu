import React from 'react'
import { Folder, Trash2 } from 'lucide-react'
import { IconButton, cx } from './ui'

function folderName(folder) {
  return folder.split('\\').filter(Boolean).pop() || folder
}

function FolderList({ folders, currentFolder, onSelectFolder, onRemoveFolder }) {
  if (!folders || folders.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 bg-white/60 px-3 py-4 text-center dark:border-[#30363d] dark:bg-[#161b22]/60">
        <Folder className="mx-auto mb-2 text-zinc-400 dark:text-[#8b949e]" size={18} />
        <p className="text-sm font-medium text-zinc-700 dark:text-[#c9d1d9]">尚未添加文件夹</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b949e]">添加程序目录后会显示在这里。</p>
      </div>
    )
  }

  return (
    <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
      {folders.map((folder) => (
        <div
          key={folder}
          className={cx(
            'group flex items-stretch rounded-md transition-colors',
            folder === currentFolder
              ? 'bg-[#dbeafe] text-[#0969da] dark:bg-[#1f6feb26] dark:text-[#58a6ff]'
              : 'text-zinc-700 hover:bg-zinc-200/70 dark:text-[#c9d1d9] dark:hover:bg-[#21262d]'
          )}
        >
          <button
            onClick={() => onSelectFolder(folder)}
            className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
            title={folder}
          >
            <Folder size={16} className="flex-shrink-0" />
            <span className="truncate text-sm font-medium">
              {folderName(folder)}
            </span>
          </button>
          <IconButton
            onClick={() => onRemoveFolder(folder)}
            label="移除文件夹"
            className="m-1 h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      ))}
    </div>
  )
}

export default FolderList
