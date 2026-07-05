import React, { useState, useEffect } from 'react'
import FileList from './FileList'

function MainContent({ appState, onLaunchFile, onOpenFolder, onGoBack, canGoBack }) {
  const [searchQuery, setSearchQuery] = useState('')

  // Reset search when current folder changes
  useEffect(() => {
    setSearchQuery('')
  }, [appState.currentFolder])

  // Filter files based on search query
  const filteredFiles = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return appState.files || []
    }

    const query = searchQuery.toLowerCase().trim()
    return (appState.files || []).filter(file =>
      file.name.toLowerCase().includes(query) ||
      file.path.toLowerCase().includes(query)
    )
  }, [appState.files, searchQuery])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white p-6 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">程序启动器</h2>
            <p className="text-blue-100 mt-1">
              {appState.currentFolder
                ? `文件夹: ${appState.currentFolder}`
                : '选择文件夹以查看程序'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            {appState.currentFolder && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索文件或文件夹..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10 py-2 w-64 rounded-lg bg-blue-700/30 border border-blue-500/50 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
                    title="清除搜索"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
            {canGoBack && (
              <button
                onClick={onGoBack}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-900 text-white font-medium rounded-lg flex items-center gap-2 transition-colors duration-200"
              >
                <span>⬅️</span>
                返回上层
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
        {!appState.currentFolder ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">未选择文件夹</p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">从侧边栏选择文件夹以查看程序</p>
            </div>
          </div>
        ) : (
          <>
            {/* Search results info */}
            {searchQuery && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  搜索 "<span className="font-semibold">{searchQuery}</span>" 找到 {filteredFiles.length} 个结果
                  <button
                    onClick={clearSearch}
                    className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 rounded transition-colors"
                  >
                    清除搜索
                  </button>
                </p>
              </div>
            )}
            <FileList
              files={filteredFiles}
              onLaunchFile={onLaunchFile}
              onOpenFolder={onOpenFolder}
              searchQuery={searchQuery}
            />
          </>
        )}
      </div>
    </main>
  )
}

export default MainContent
