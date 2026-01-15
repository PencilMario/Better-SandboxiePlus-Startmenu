package main

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
)

// App struct
type App struct {
	ctx              context.Context
	configManager    *ConfigManager
	fileManager      *FileManager
	sandboxieManager *SandboxieManager
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		configManager:    NewConfigManager(),
		fileManager:      NewFileManager(),
		sandboxieManager: NewSandboxieManager(),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// GetAppState returns the current application state
func (a *App) GetAppState() *AppState {
	config := a.configManager.GetConfig()
	var files []FileInfo

	if config.CurrentFolder != "" {
		var err error
		files, err = a.fileManager.GetExecutableFiles(config.CurrentFolder)
		if err != nil {
			files = []FileInfo{}
		}
	}

	sandboxes := a.configManager.GetAvailableSandboxes()

	return &AppState{
		FolderPaths:        config.FolderPaths,
		CurrentFolder:      config.CurrentFolder,
		Files:              files,
		SelectedSandbox:    config.SelectedSandbox,
		AvailableSandboxes: sandboxes,
	}
}

// SelectFolder selects a folder and returns the updated state
func (a *App) SelectFolder(folderPath string) (*AppState, error) {
	if err := a.fileManager.ValidateDirectory(folderPath); err != nil {
		return nil, fmt.Errorf("invalid folder: %v", err)
	}

	if err := a.configManager.AddFolderPath(folderPath); err != nil {
		return nil, err
	}

	return a.GetAppState(), nil
}

// SetCurrentFolder sets the current folder
func (a *App) SetCurrentFolder(folderPath string) (*AppState, error) {
	if err := a.configManager.SetCurrentFolder(folderPath); err != nil {
		return nil, err
	}

	return a.GetAppState(), nil
}

// RemoveFolder removes a folder from the list
func (a *App) RemoveFolder(folderPath string) (*AppState, error) {
	if err := a.configManager.RemoveFolderPath(folderPath); err != nil {
		return nil, err
	}

	return a.GetAppState(), nil
}

// SetSelectedSandbox sets the selected sandbox
func (a *App) SetSelectedSandbox(sandbox string) (*AppState, error) {
	if err := a.configManager.SetSelectedSandbox(sandbox); err != nil {
		return nil, err
	}

	return a.GetAppState(), nil
}

// LaunchProgram launches a program in the selected sandbox
func (a *App) LaunchProgram(filePath string) (*LaunchResponse, error) {
	config := a.configManager.GetConfig()

	pid, err := a.sandboxieManager.LaunchProgram(filePath, config.SelectedSandbox)
	if err != nil {
		return &LaunchResponse{
			Success: false,
			Message: err.Error(),
			PID:     0,
		}, nil
	}

	return &LaunchResponse{
		Success: true,
		Message: fmt.Sprintf("Program launched with PID %d", pid),
		PID:     pid,
	}, nil
}

// IsSandboxieAvailable checks if Sandboxie is installed
func (a *App) IsSandboxieAvailable() bool {
	return a.sandboxieManager.IsAvailable()
}

// OpenFolderDialog opens a folder selection dialog
func (a *App) OpenFolderDialog() (string, error) {
	fmt.Print("OpenFolderDialog start")
	folderPath, err := pickFolderPowerShell()
	if err != nil {
		return "", err
	}
	return folderPath, nil
}

// pickFolderPowerShell uses PowerShell to open folder picker dialog
func pickFolderPowerShell() (string, error) {
	cmd := exec.Command("powershell", "-Command", `
		[System.Reflection.Assembly]::LoadWithPartialName('System.windows.forms') | Out-Null
		$folder = New-Object System.Windows.Forms.FolderBrowserDialog
		$folder.Description = "Select a folder containing programs"
		$folder.ShowNewFolderButton = $false
		$result = $folder.ShowDialog()
		if ($result -eq 'OK') {
			Write-Host $folder.SelectedPath
		}
	`)

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("folder selection failed: %v", err)
	}

	folderPath := strings.TrimSpace(string(output))
	if folderPath == "" {
		return "", fmt.Errorf("no folder selected")
	}

	return folderPath, nil
}

// AddAvailableSandbox adds a sandbox to the available sandboxes list
func (a *App) AddAvailableSandbox(sandbox string) (*AppState, error) {
	if err := a.configManager.AddAvailableSandbox(sandbox); err != nil {
		return nil, err
	}
	return a.GetAppState(), nil
}

// RemoveAvailableSandbox removes a sandbox from the available sandboxes list
func (a *App) RemoveAvailableSandbox(sandbox string) (*AppState, error) {
	if err := a.configManager.RemoveAvailableSandbox(sandbox); err != nil {
		return nil, err
	}
	return a.GetAppState(), nil
}

// GetAvailableSandboxes returns the list of available sandboxes
func (a *App) GetAvailableSandboxes() []string {
	return a.configManager.GetAvailableSandboxes()
}

// GetFileIcon returns the base64 encoded icon for a file
func (a *App) GetFileIcon(filePath string) string {
	return GetFileIconBase64(filePath)
}
