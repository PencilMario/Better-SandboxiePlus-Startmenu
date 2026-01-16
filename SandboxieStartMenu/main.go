package main

import (
	"embed"
	"syscall"
	"unsafe"

	"github.com/lxn/win"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Single instance check using mutex
	kernel32 := syscall.NewLazyDLL("kernel32.dll")
	createMutex := kernel32.NewProc("CreateMutexW")

	mutexName, _ := syscall.UTF16PtrFromString("Local\\SandboxieStartMenuInstance")
	mutex, _, err := createMutex.Call(0, 0, uintptr(unsafe.Pointer(mutexName)))

	if mutex == 0 {
		// Check if mutex already exists (another instance is running)
		if errno, ok := err.(syscall.Errno); ok && errno == syscall.ERROR_ALREADY_EXISTS {
			// Find existing window
			windowTitle, _ := syscall.UTF16PtrFromString("SandboxieStartMenu")
			hwnd := win.FindWindow(nil, windowTitle)
			if hwnd != 0 {
				// Restore window if minimized
				if win.IsIconic(hwnd) {
					win.ShowWindow(hwnd, win.SW_RESTORE)
				}
				// Bring window to foreground
				win.SetForegroundWindow(hwnd)
				win.BringWindowToTop(hwnd)
			}
			return // Exit this instance
		}
		// If it's some other error, we'll continue anyway
	}
	defer syscall.CloseHandle(syscall.Handle(mutex))

	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "SandboxieStartMenu",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
