import React from 'react'
import FileList from './FileList'

function MainContent({ appState, onLaunchFile, onOpenFolder, onGoBack, canGoBack }) {
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
          <FileList
            files={appState.files || []}
            onLaunchFile={onLaunchFile}
            onOpenFolder={onOpenFolder}
          />
        )}
      </div>
    </main>
  )
}

export default MainContent
