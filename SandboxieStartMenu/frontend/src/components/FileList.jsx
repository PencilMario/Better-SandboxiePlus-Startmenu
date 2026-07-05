import React, { useState, useEffect } from 'react'
import { GetFileIcon } from '../../wailsjs/go/main/App'
import FileItem from './FileItem'
import { EmptyState } from './ui'
import { FileSearch, Inbox } from 'lucide-react'

function FileList({ files, onLaunchFile, onOpenFolder, searchQuery = '' }) {
  const [fileIcons, setFileIcons] = useState({})
  const [loadingIcons, setLoadingIcons] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadIcons = async () => {
      setLoadingIcons(true)
      const entries = await Promise.all((files || []).map(async (file) => {
        try {
          const iconData = await GetFileIcon(file.path)
          return iconData ? [file.path, iconData] : null
        } catch (err) {
          console.error('Error loading icon for', file.path, ':', err)
          return null
        }
      }))

      if (!cancelled) {
        setFileIcons(Object.fromEntries(entries.filter(Boolean)))
        setLoadingIcons(false)
      }
    }

    if (files && files.length > 0) {
      loadIcons()
    } else {
      setFileIcons({})
      setLoadingIcons(false)
    }

    return () => {
      cancelled = true
    }
  }, [files])

  if (!files || files.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-[#30363d] dark:bg-[#161b22]">
        <EmptyState
          icon={searchQuery ? FileSearch : Inbox}
          title={searchQuery ? '未找到匹配的项目' : '未找到程序'}
          description={searchQuery
            ? `没有找到包含 "${searchQuery}" 的文件或文件夹`
            : '此文件夹不包含可执行文件或可进入的目录'}
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-500 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#8b949e]">
        <span>名称</span>
        <span>{loadingIcons ? '正在加载图标' : `${files.length} 个项目`}</span>
      </div>
      <div className="divide-y divide-zinc-200 dark:divide-[#30363d]">
      {files.map((file) => (
        <FileItem
          key={file.path}
          file={file}
          icon={fileIcons[file.path]}
          onLaunch={onLaunchFile}
          onOpenFolder={onOpenFolder}
        />
      ))}
      </div>
    </div>
  )
}

export default FileList
