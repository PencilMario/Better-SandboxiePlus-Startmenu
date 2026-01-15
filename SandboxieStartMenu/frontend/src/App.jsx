import React, { useState, useEffect, useCallback } from 'react'
import {
  GetAppState,
  SelectFolder,
  SetCurrentFolder,
  RemoveFolder,
  SetSelectedSandbox,
  LaunchProgram,
  IsSandboxieAvailable,
  OpenFolderDialog,
  AddAvailableSandbox,
  RemoveAvailableSandbox,
  GetFileIcon
} from '../wailsjs/go/main/App'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import Toast from './components/Toast'

function App() {
  const [appState, setAppState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Initialize app and detect system theme
  useEffect(() => {
    // Detect system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(prefersDark)

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      setIsDark(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)

    const init = async () => {
      try {
        // Load sidebar collapsed state from localStorage
        const savedSidebarState = localStorage.getItem('sidebarCollapsed')
        if (savedSidebarState !== null) {
          setSidebarCollapsed(savedSidebarState === 'true')
        }

        const available = await IsSandboxieAvailable()
        if (!available) {
          showToast('Sandboxie 未安装。请先安装 Sandboxie。', 'error')
          return
        }

        const state = await GetAppState()
        setAppState(state)
      } catch (err) {
        console.error('Initialization error:', err)
        showToast('初始化应用失败', 'error')
      } finally {
        setLoading(false)
      }
    }

    init()

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Update document class for dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const newState = !prev
      localStorage.setItem('sidebarCollapsed', newState.toString())
      return newState
    })
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSelectFolder = useCallback(async (folderPath) => {
    try {
      const newState = await SetCurrentFolder(folderPath)
      setAppState(newState)
    } catch (err) {
      console.error('Error selecting folder:', err)
      showToast('选择文件夹失败', 'error')
    }
  }, [])

  const handleRemoveFolder = useCallback(async (folderPath) => {
    if (!window.confirm(`是否从列表中移除文件夹 "${folderPath}"？`)) {
      return
    }

    try {
      const newState = await RemoveFolder(folderPath)
      setAppState(newState)
      showToast(`文件夹已移除: ${folderPath}`, 'success')
    } catch (err) {
      console.error('Error removing folder:', err)
      showToast(`移除文件夹失败: ${err.message || err}`, 'error')
    }
  }, [])

  const handleAddFolder = useCallback(async () => {
    try {
      const folderPath = await OpenFolderDialog()
      if (folderPath && folderPath !== '') {
        const newState = await SelectFolder(folderPath)
        setAppState(newState)
        showToast(`文件夹已添加: ${folderPath}`, 'success')
      }
    } catch (err) {
      console.error('Error opening folder dialog:', err)
      showToast(`打开文件夹对话框失败: ${err.message || err}`, 'error')
    }
  }, [])

  const handleChangeSandbox = useCallback(async (sandbox) => {
    try {
      const newState = await SetSelectedSandbox(sandbox)
      setAppState(newState)
    } catch (err) {
      console.error('Error changing sandbox:', err)
      showToast('切换沙盒失败', 'error')
    }
  }, [])

  const handleAddSandbox = useCallback(async (sandboxName) => {
    if (!sandboxName.trim()) {
      showToast('请输入沙盒名称', 'error')
      return
    }

    if (sandboxName.includes(':')) {
      showToast('沙盒名称不能包含冒号', 'error')
      return
    }

    try {
      const newState = await AddAvailableSandbox(sandboxName)
      setAppState(newState)
      showToast(`沙盒 "${sandboxName}" 已添加`, 'success')
    } catch (err) {
      console.error('Error adding sandbox:', err)
      showToast(`添加沙盒失败: ${err.message || err}`, 'error')
    }
  }, [])

  const handleRemoveSandbox = useCallback(async (sandbox) => {
    if (sandbox === '__ask__') {
      showToast('无法移除 "__ask__" 选项', 'error')
      return
    }

    if (!window.confirm(`是否从列表中移除沙盒 "${sandbox}"？`)) {
      return
    }

    try {
      const newState = await RemoveAvailableSandbox(sandbox)
      setAppState(newState)
      showToast(`沙盒 "${sandbox}" 已移除`, 'success')
    } catch (err) {
      console.error('Error removing sandbox:', err)
      showToast(`移除沙盒失败: ${err.message || err}`, 'error')
    }
  }, [])

  const handleLaunchFile = useCallback(async (filePath) => {
    try {
      const response = await LaunchProgram(filePath)
      if (response.success) {
        showToast(`程序启动成功 (PID: ${response.pid})`, 'success')
      } else {
        showToast(`启动程序失败: ${response.message}`, 'error')
      }
    } catch (err) {
      console.error('Error launching file:', err)
      showToast(`启动程序失败: ${err.message || err}`, 'error')
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">加载中...</p>
        </div>
      </div>
    )
  }

  if (!appState) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">加载应用失败</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        appState={appState}
        onSelectFolder={handleSelectFolder}
        onRemoveFolder={handleRemoveFolder}
        onAddFolder={handleAddFolder}
        onChangeSandbox={handleChangeSandbox}
        onAddSandbox={handleAddSandbox}
        onRemoveSandbox={handleRemoveSandbox}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <MainContent
        appState={appState}
        onLaunchFile={handleLaunchFile}
      />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default App
