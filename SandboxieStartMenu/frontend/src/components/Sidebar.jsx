import React, { useState } from 'react'
import FolderList from './FolderList'
import SandboxSelector from './SandboxSelector'
import SandboxManager from './SandboxManager'

function Sidebar({
  appState,
  onSelectFolder,
  onRemoveFolder,
  onAddFolder,
  onChangeSandbox,
  onAddSandbox,
  onRemoveSandbox,
  onOpenConfigFile,
  onOpenSandboxieManager,
  isCollapsed = false,
  onToggle,
}) {
  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-80'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 transition-all duration-300`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          {!isCollapsed ? (
            <>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  沙盒
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">开始菜单</p>
              </div>
              <button
                onClick={onToggle}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="收起侧边栏"
              >
                <span className="text-xl">←</span>
              </button>
            </>
          ) : (
            <div className="w-full flex flex-col items-center space-y-4">
              <button
                onClick={onToggle}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="展开侧边栏"
              >
                <span className="text-xl">→</span>
              </button>
              <button
                onClick={onAddFolder}
                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="添加文件夹"
              >
                <span className="text-xl">📁</span>
              </button>
              <button
                onClick={onOpenSandboxieManager}
                className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="打开 Sandboxie Manager"
              >
                <span className="text-xl">🔒</span>
              </button>
              <button
                onClick={onOpenConfigFile}
                className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                title="打开配置文件"
              >
                <span className="text-xl">⚙️</span>
              </button>
            </div>
          )}
        </div>

        {/* Folders Section */}
        <div className={`mb-8 ${isCollapsed ? 'hidden' : ''}`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-lg">📁</span>
            文件夹
          </h2>
          <FolderList
            folders={appState.folderPaths || []}
            currentFolder={appState.currentFolder}
            onSelectFolder={onSelectFolder}
            onRemoveFolder={onRemoveFolder}
          />
          <button
            onClick={onAddFolder}
            className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>+</span>
            添加文件夹
          </button>
        </div>

        {/* Sandbox Selector */}
        <div className={`mb-8 ${isCollapsed ? 'hidden' : ''}`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-lg">🎯</span>
            活动沙盒
          </h2>
          <SandboxSelector
            sandboxes={appState.availableSandboxes || []}
            selectedSandbox={appState.selectedSandbox}
            onChangeSandbox={onChangeSandbox}
          />
        </div>

        {!appState.sandboxesAutoDetected && (
          <div className={`${isCollapsed ? 'hidden' : ''}`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-lg">⚙️</span>
              管理沙盒
            </h2>
            <SandboxManager
              sandboxes={appState.availableSandboxes || []}
              onAddSandbox={onAddSandbox}
              onRemoveSandbox={onRemoveSandbox}
            />
          </div>
        )}

        {/* Configuration Button */}
        <div className={`mt-8 ${isCollapsed ? 'hidden' : ''}`}>
          <button
            onClick={onOpenSandboxieManager}
            className="w-full px-4 py-2 mb-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>🔒</span>
            打开 Sandboxie Manager
          </button>
          <button
            onClick={onOpenConfigFile}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>⚙️</span>
            打开配置文件
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            在默认文本编辑器中打开配置文件
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
