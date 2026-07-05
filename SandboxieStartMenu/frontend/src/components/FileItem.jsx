import React from 'react'
import { File, Folder, Link, Play, Terminal } from 'lucide-react'
import { Badge, Button } from './ui'

function FileItem({ file, icon, onLaunch, onOpenFolder }) {
  const getDefaultIcon = () => {
    if (file.isDir) {
      return <Folder size={20} />
    }

    switch (file.type) {
      case 'exe':
        return <File size={20} />
      case 'lnk':
        return <Link size={20} />
      case 'bat':
      case 'cmd':
        return <Terminal size={20} />
      default:
        return <File size={20} />
    }
  }

  const typeLabel = file.isDir ? '文件夹' : file.type?.toUpperCase() || '文件'
  const typeTone = file.isDir ? 'neutral' : file.type === 'exe' ? 'success' : 'warning'

  return (
    <div className="group flex min-h-[68px] items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-[#21262d]">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#8b949e]">
        {icon ? (
          <img
            src={icon}
            alt={file.name}
            className="h-7 w-7 object-contain"
          />
        ) : (
          getDefaultIcon()
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-zinc-950 dark:text-[#f0f6fc]" title={file.name}>{file.name}</h3>
          <Badge tone={typeTone}>{typeLabel}</Badge>
        </div>
        <p className="mt-1 truncate text-xs text-zinc-500 dark:text-[#8b949e]" title={file.path}>{file.path}</p>
      </div>

      <div className="flex flex-shrink-0 items-center">
        {file.isDir ? (
          <Button
            onClick={() => onOpenFolder(file.path)}
            variant="secondary"
            size="sm"
          >
            <Folder size={14} />
            打开
          </Button>
        ) : (
          <Button
            onClick={() => onLaunch(file.path)}
            variant="primary"
            size="sm"
          >
            <Play size={14} />
            启动
          </Button>
        )}
      </div>
    </div>
  )
}

export default FileItem
