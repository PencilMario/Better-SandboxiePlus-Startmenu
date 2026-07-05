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
  GetFileIcon,
  OpenConfigFile,
  OpenFolder,
  GoBack,
  CanGoBack,
  OpenSandboxieManager,
  GetAvailableSandboxFolders
} from '../wailsjs/go/main/App'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import Toast from './components/Toast'
import AddFolderDialog from './components/AddFolderDialog'
import { ConfirmDialog } from './components/ui'
import { Loader2, ShieldAlert } from 'lucide-react'

function App() {
  const [appState, setAppState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false)
  const [sandboxFolders, setSandboxFolders] = useState([])
  const [confirmDialog, setConfirmDialog] = useState(null)

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

  // Update canGoBack when appState changes
  useEffect(() => {
    const updateCanGoBack = async () => {
      if (!appState || !appState.currentFolder) {
        setCanGoBack(false)
        return
      }

      try {
        const canGoBackResult = await CanGoBack()
        setCanGoBack(canGoBackResult)
      } catch (err) {
        console.error('Error checking if can go back:', err)
        setCanGoBack(false)
      }
    }

    updateCanGoBack()
  }, [appState])

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

  const requestConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...options,
        onResolve: resolve,
      })
    })
  }, [])

  const resolveConfirm = useCallback((result) => {
    setConfirmDialog((dialog) => {
      if (dialog?.onResolve) {
        dialog.onResolve(result)
      }
      return null
    })
  }, [])

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
    const confirmed = await requestConfirm({
      title: '移除文件夹',
      description: `是否从列表中移除 "${folderPath}"？这不会删除磁盘上的文件。`,
      confirmLabel: '移除',
      destructive: true,
    })

    if (!confirmed) {
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
  }, [requestConfirm])

  const handleAddFolder = useCallback(async () => {
    try {
      const folders = await GetAvailableSandboxFolders()
      setSandboxFolders(folders || [])
      setShowAddFolderDialog(true)
    } catch (err) {
      console.error('Error loading sandbox folders:', err)
      setSandboxFolders([])
      setShowAddFolderDialog(true)
    }
  }, [])

  const handleManualAddFolder = useCallback(async () => {
    try {
      setShowAddFolderDialog(false)
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

  const handleSelectSandboxFolder = useCallback(async (folderPath) => {
    try {
      const newState = await SelectFolder(folderPath)
      setAppState(newState)
      setShowAddFolderDialog(false)
      showToast(`沙盒文件夹已添加: ${folderPath}`, 'success')
    } catch (err) {
      console.error('Error adding sandbox folder:', err)
      showToast(`添加沙盒文件夹失败: ${err.message || err}`, 'error')
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

    const confirmed = await requestConfirm({
      title: '移除沙盒',
      description: `是否从列表中移除沙盒 "${sandbox}"？这不会修改 Sandboxie 本身。`,
      confirmLabel: '移除',
      destructive: true,
    })

    if (!confirmed) {
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
  }, [requestConfirm])

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

  const handleOpenConfigFile = useCallback(async () => {
    try {
      await OpenConfigFile()
      showToast('配置文件已打开', 'success')
    } catch (err) {
      console.error('Error opening config file:', err)
      showToast(`打开配置文件失败: ${err.message || err}`, 'error')
    }
  }, [])

  const handleOpenSandboxieManager = useCallback(async () => {
    try {
      await OpenSandboxieManager()
      showToast('Sandboxie Manager 已打开', 'success')
    } catch (err) {
      console.error('Error opening Sandboxie Manager:', err)
      showToast(`打开 Sandboxie Manager 失败: ${err.message || err}`, 'error')
    }
  }, [])

  const handleOpenFolder = useCallback(async (folderPath) => {
    try {
      const newState = await OpenFolder(folderPath)
      setAppState(newState)
    } catch (err) {
      console.error('Error opening folder:', err)
      showToast(`打开文件夹失败: ${err.message || err}`, 'error')
    }
  }, [])

  const handleGoBack = useCallback(async () => {
    try {
      const newState = await GoBack()
      setAppState(newState)
    } catch (err) {
      console.error('Error going back:', err)
      showToast(`返回上层失败: ${err.message || err}`, 'error')
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f6f8fa] text-zinc-700 dark:bg-[#0d1117] dark:text-[#c9d1d9]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-[#0969da] dark:text-[#58a6ff]" size={30} />
          <p className="text-sm font-medium">正在加载 Sandboxie Start Menu</p>
        </div>
      </div>
    )
  }

  if (!appState) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f6f8fa] text-zinc-700 dark:bg-[#0d1117] dark:text-[#c9d1d9]">
        <div className="text-center">
          <ShieldAlert className="mx-auto mb-4 text-[#cf222e] dark:text-[#f85149]" size={34} />
          <p className="text-base font-semibold text-zinc-950 dark:text-[#f0f6fc]">加载应用失败</p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-[#8b949e]">请确认 Sandboxie 已安装并重新启动应用。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#f6f8fa] text-zinc-900 dark:bg-[#0d1117] dark:text-[#c9d1d9]">
      <Sidebar
        appState={appState}
        onSelectFolder={handleSelectFolder}
        onRemoveFolder={handleRemoveFolder}
        onAddFolder={handleAddFolder}
        onChangeSandbox={handleChangeSandbox}
        onAddSandbox={handleAddSandbox}
        onRemoveSandbox={handleRemoveSandbox}
        onOpenConfigFile={handleOpenConfigFile}
        onOpenSandboxieManager={handleOpenSandboxieManager}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <MainContent
        appState={appState}
        onLaunchFile={handleLaunchFile}
        onOpenFolder={handleOpenFolder}
        onGoBack={handleGoBack}
        canGoBack={canGoBack}
      />
      {showAddFolderDialog && (
        <AddFolderDialog
          sandboxFolders={sandboxFolders}
          onManualSelect={handleManualAddFolder}
          onSelectSandboxFolder={handleSelectSandboxFolder}
          onClose={() => setShowAddFolderDialog(false)}
        />
      )}
      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title}
        description={confirmDialog?.description}
        confirmLabel={confirmDialog?.confirmLabel}
        destructive={confirmDialog?.destructive}
        onConfirm={() => resolveConfirm(true)}
        onCancel={() => resolveConfirm(false)}
      />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default App
