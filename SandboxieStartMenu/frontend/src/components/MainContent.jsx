import React, { useState, useEffect } from 'react'
import FileList from './FileList'
import { ArrowLeft, Folder, Search, X } from 'lucide-react'
import { Badge, Button, EmptyState, IconButton } from './ui'

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

  const currentFolderName = appState.currentFolder
    ? appState.currentFolder.split('\\').filter(Boolean).pop() || appState.currentFolder
    : ''

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div className="border-b border-zinc-200 bg-white dark:border-[#30363d] dark:bg-[#161b22]">
        <div className="flex min-h-[72px] items-center justify-between gap-4 px-6 py-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="truncate text-lg font-semibold text-zinc-950 dark:text-[#f0f6fc]">程序启动器</h2>
              <Badge tone={appState.selectedSandbox === '__ask__' ? 'warning' : 'success'}>
                {appState.selectedSandbox === '__ask__' ? '运行时询问' : appState.selectedSandbox || 'DefaultBox'}
              </Badge>
            </div>
            <p className="truncate text-sm text-zinc-500 dark:text-[#8b949e]" title={appState.currentFolder || ''}>
              {appState.currentFolder ? appState.currentFolder : '选择文件夹以查看程序'}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {appState.currentFolder && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索文件或文件夹..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="h-9 w-72 rounded-md border border-zinc-300 bg-white pl-9 pr-9 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da]/20 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc] dark:placeholder:text-[#8b949e]"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-[#8b949e]" size={15} />
                {searchQuery && (
                  <IconButton
                    onClick={clearSearch}
                    label="清除搜索"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                  >
                    <X size={14} />
                  </IconButton>
                )}
              </div>
            )}
            {canGoBack && (
              <Button onClick={onGoBack} variant="secondary">
                <ArrowLeft size={16} />
                返回上层
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {!appState.currentFolder ? (
          <EmptyState
            icon={Folder}
            title="未选择文件夹"
            description="从左侧选择一个文件夹，或添加新的沙盒目录。"
          />
        ) : (
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-zinc-950 dark:text-[#f0f6fc]">{currentFolderName}</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b949e]">
                  {filteredFiles.length} 个项目{searchQuery ? '匹配当前搜索' : ''}
                </p>
              </div>
            </div>

            {searchQuery && (
              <div className="mb-3 rounded-md border border-[#0969da]/20 bg-[#ddf4ff] px-3 py-2 text-sm text-[#0969da] dark:border-[#58a6ff]/30 dark:bg-[#1f6feb26] dark:text-[#58a6ff]">
                搜索 "<span className="font-semibold">{searchQuery}</span>" 找到 {filteredFiles.length} 个结果
                <button
                  onClick={clearSearch}
                  className="ml-2 rounded px-1.5 py-0.5 text-xs font-medium hover:bg-[#0969da]/10 dark:hover:bg-[#58a6ff]/10"
                >
                    清除搜索
                </button>
              </div>
            )}
            <FileList
              files={filteredFiles}
              onLaunchFile={onLaunchFile}
              onOpenFolder={onOpenFolder}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
    </main>
  )
}

export default MainContent
