import React from 'react'

function FileItem({ file, icon, onLaunch, onOpenFolder }) {
  const getDefaultIcon = () => {
    if (file.isDir) {
      return '📁'
    }

    switch (file.type) {
      case 'exe':
        return '⚙️'
      case 'lnk':
        return '🔗'
      case 'bat':
      case 'cmd':
        return '📝'
      default:
        return '📄'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg dark:hover:shadow-blue-900/20 transition-all duration-200 overflow-hidden group p-2 flex gap-2 items-stretch">
      {/* Icon Area - Left */}
      <div className="flex-shrink-0 w-14 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 group-hover:from-blue-50 dark:group-hover:from-blue-900/30 group-hover:to-indigo-50 dark:group-hover:to-indigo-900/30 transition-colors">
        {icon ? (
          <img
            src={icon}
            alt={file.name}
            className="w-10 h-10 object-contain"
          />
        ) : (
          <span className="text-2xl">{getDefaultIcon()}</span>
        )}
      </div>

      {/* Content Area - Right */}
      <div className="flex-1 flex flex-col min-w-0 justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm" title={file.name}>
            {file.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={file.path}>
            {file.path}
          </p>
        </div>

        {/* Action Button */}
        {file.isDir ? (
          <button
            onClick={() => onOpenFolder(file.path)}
            className="w-full px-2 py-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium rounded text-xs flex items-center justify-center gap-1 transition-colors duration-200 mt-1"
          >
            <span>📂</span>
            打开
          </button>
        ) : (
          <button
            onClick={() => onLaunch(file.path)}
            className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded text-xs flex items-center justify-center gap-1 transition-colors duration-200 mt-1"
          >
            <span>🚀</span>
            启动
          </button>
        )}
      </div>
    </div>
  )
}

export default FileItem
