import React, { useState, useEffect } from 'react'
import { GetFileIcon } from '../../wailsjs/go/main/App'
import FileItem from './FileItem'

function FileList({ files, onLaunchFile, onOpenFolder, searchQuery = '' }) {
  const [fileIcons, setFileIcons] = useState({})
  const [loadingIcons, setLoadingIcons] = useState(true)

  useEffect(() => {
    const loadIcons = async () => {
      const icons = {}
      for (const file of files) {
        try {
          const iconData = await GetFileIcon(file.path)
          if (iconData && iconData !== '') {
            icons[file.path] = iconData
          }
        } catch (err) {
          console.error('Error loading icon for', file.path, ':', err)
        }
      }
      setFileIcons(icons)
      setLoadingIcons(false)
    }

    if (files && files.length > 0) {
      loadIcons()
    } else {
      setLoadingIcons(false)
    }
  }, [files])

  if (!files || files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {searchQuery ? '🔍' : '📭'}
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
            {searchQuery ? '未找到匹配的项目' : '未找到程序'}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {searchQuery
              ? `没有找到包含 "${searchQuery}" 的文件或文件夹`
              : '此文件夹不包含可执行文件'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
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
  )
}

export default FileList
