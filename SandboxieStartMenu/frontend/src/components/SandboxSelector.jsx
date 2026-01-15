import React from 'react'

function SandboxSelector({ sandboxes, selectedSandbox, onChangeSandbox }) {
  return (
    <select
      value={selectedSandbox || ''}
      onChange={(e) => onChangeSandbox(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    >
      {(!sandboxes || sandboxes.length === 0) ? (
        <option value="DefaultBox">DefaultBox</option>
      ) : (
        sandboxes.map((sandbox) => (
          <option key={sandbox} value={sandbox}>
            {sandbox === '__ask__' ? `${sandbox} (运行时询问)` : sandbox}
          </option>
        ))
      )}
    </select>
  )
}

export default SandboxSelector
