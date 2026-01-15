import React from 'react'

function FolderList({ folders, currentFolder, onSelectFolder, onRemoveFolder }) {
  if (!folders || folders.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">尚未添加文件夹</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
      {folders.map((folder) => (
        <div
          key={folder}
          className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
            folder === currentFolder
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 shadow-sm'
              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          }`}
        >
          <button
            onClick={() => onSelectFolder(folder)}
            className="flex-1 text-left flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="text-lg">📂</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {folder.split('\\').pop() || folder}
            </span>
          </button>
          <button
            onClick={() => onRemoveFolder(folder)}
            className="ml-2 p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="移除文件夹"
          >
            <span className="text-lg">×</span>
          </button>
        </div>
      ))}
    </div>
  )
}

export default FolderList
