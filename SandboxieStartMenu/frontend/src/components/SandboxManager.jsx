import React, { useState } from 'react'

function SandboxManager({ sandboxes, onAddSandbox, onRemoveSandbox }) {
  const [newSandboxName, setNewSandboxName] = useState('')

  const handleAddClick = () => {
    if (newSandboxName.trim()) {
      onAddSandbox(newSandboxName)
      setNewSandboxName('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddClick()
    }
  }

  return (
    <div className="space-y-3">
      {/* Sandbox List */}
      <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
        {(!sandboxes || sandboxes.length === 0) ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">未添加沙盒</p>
        ) : (
          sandboxes.map((sandbox) => (
            <div
              key={sandbox}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {sandbox === '__ask__' ? `${sandbox} (询问)` : sandbox}
              </span>
              <button
                onClick={() => onRemoveSandbox(sandbox)}
                disabled={sandbox === '__ask__'}
                className={`p-1 rounded transition-colors ${
                  sandbox === '__ask__'
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                }`}
                title={sandbox === '__ask__' ? '无法移除 __ask__ 选项' : '移除沙盒'}
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Sandbox Form */}
      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={newSandboxName}
          onChange={(e) => setNewSandboxName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="新沙盒名称"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleAddClick}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          添加
        </button>
      </div>
    </div>
  )
}

export default SandboxManager
