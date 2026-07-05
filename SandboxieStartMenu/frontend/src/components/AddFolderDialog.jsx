import React from 'react'

function AddFolderDialog({ sandboxFolders, onManualSelect, onSelectSandboxFolder, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">添加文件夹</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">选择添加方式</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            title="关闭"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <button
            onClick={onManualSelect}
            className="flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
          >
            <span>
              <span className="block text-sm font-semibold text-blue-900 dark:text-blue-100">手动选择文件夹</span>
              <span className="mt-1 block text-xs text-blue-700 dark:text-blue-300">打开系统文件夹选择窗口</span>
            </span>
            <span className="text-xl text-blue-700 dark:text-blue-300">📁</span>
          </button>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">现有沙盒文件夹</h3>
            {sandboxFolders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-5 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                没有可添加的沙盒文件夹
              </div>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                {sandboxFolders.map((folder) => (
                  <button
                    key={`${folder.sandbox}:${folder.path}`}
                    onClick={() => onSelectSandboxFolder(folder.path)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:border-green-300 hover:bg-green-50 dark:border-gray-700 dark:bg-gray-700 dark:hover:border-green-700 dark:hover:bg-green-900/20"
                  >
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{folder.sandbox}</span>
                    <span className="mt-1 block break-all text-xs text-gray-500 dark:text-gray-300">{folder.path}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddFolderDialog
