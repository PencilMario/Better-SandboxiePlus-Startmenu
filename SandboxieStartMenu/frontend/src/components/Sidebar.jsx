import React from 'react'
import FolderList from './FolderList'
import SandboxSelector from './SandboxSelector'
import SandboxManager from './SandboxManager'
import { Badge, IconButton } from './ui'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderPlus,
  PanelLeft,
  Settings,
  Shield,
} from 'lucide-react'

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
    <aside className="flex h-screen flex-shrink-0 border-r border-zinc-200 bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#0d1117]">
      <div className="flex w-14 flex-col items-center gap-2 border-r border-zinc-200 bg-white px-2 py-3 dark:border-[#30363d] dark:bg-[#161b22]">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#24292f] text-white dark:bg-[#238636]">
          <Shield size={21} />
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <IconButton label={isCollapsed ? '展开侧边栏' : '收起侧边栏'} onClick={onToggle}>
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </IconButton>
          <IconButton label="添加文件夹" onClick={onAddFolder}>
            <FolderPlus size={18} />
          </IconButton>
          <IconButton label="打开 Sandboxie Manager" onClick={onOpenSandboxieManager}>
            <ExternalLink size={18} />
          </IconButton>
          <IconButton label="打开配置文件" onClick={onOpenConfigFile}>
            <Settings size={18} />
          </IconButton>
        </div>

        <IconButton label={isCollapsed ? '展开侧边栏' : '收起侧边栏'} onClick={onToggle}>
          <PanelLeft size={18} />
        </IconButton>
      </div>

      <div className={`${isCollapsed ? 'w-0 opacity-0' : 'w-72 opacity-100'} overflow-hidden bg-[#f6f8fa] transition-all duration-200 dark:bg-[#0d1117]`}>
        <div className="flex h-full w-72 flex-col">
          <div className="border-b border-zinc-200 px-4 py-4 dark:border-[#30363d]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-zinc-950 dark:text-[#f0f6fc]">Sandboxie Start</h1>
                <p className="mt-1 text-xs text-zinc-500 dark:text-[#8b949e]">干净的沙盒启动器</p>
              </div>
              <Badge tone={appState.selectedSandbox === '__ask__' ? 'warning' : 'success'}>
                {appState.selectedSandbox === '__ask__' ? '询问' : appState.selectedSandbox || 'DefaultBox'}
              </Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <section>
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-[#8b949e]">文件夹</h2>
                <IconButton label="添加文件夹" onClick={onAddFolder} className="h-7 w-7">
                  <FolderPlus size={15} />
                </IconButton>
              </div>
              <FolderList
                folders={appState.folderPaths || []}
                currentFolder={appState.currentFolder}
                onSelectFolder={onSelectFolder}
                onRemoveFolder={onRemoveFolder}
              />
            </section>

            <section className="mt-5">
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-[#8b949e]">活动沙盒</h2>
              <SandboxSelector
                sandboxes={appState.availableSandboxes || []}
                selectedSandbox={appState.selectedSandbox}
                onChangeSandbox={onChangeSandbox}
              />
            </section>

            {!appState.sandboxesAutoDetected && (
              <section className="mt-5">
                <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-[#8b949e]">管理沙盒</h2>
            <SandboxManager
              sandboxes={appState.availableSandboxes || []}
              onAddSandbox={onAddSandbox}
              onRemoveSandbox={onRemoveSandbox}
            />
              </section>
            )}
          </div>

          <div className="border-t border-zinc-200 p-3 dark:border-[#30363d]">
            <button
              onClick={onOpenSandboxieManager}
              className="mb-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200/70 dark:text-[#c9d1d9] dark:hover:bg-[#21262d]"
            >
              <ExternalLink size={16} />
              打开 Sandboxie Manager
            </button>
            <button
              onClick={onOpenConfigFile}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200/70 dark:text-[#c9d1d9] dark:hover:bg-[#21262d]"
            >
              <Settings size={16} />
              打开配置文件
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
