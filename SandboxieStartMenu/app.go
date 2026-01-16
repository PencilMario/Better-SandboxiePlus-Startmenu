package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
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
		files, err = a.fileManager.GetDirectoryContents(config.CurrentFolder)
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
		$folder.Description = "选择包含程序的文件夹"
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

// OpenConfigFile opens the configuration file in the default text editor
func (a *App) OpenConfigFile() error {
	// Get the config file path from config manager
	configPath := a.configManager.GetConfigPath()

	// Check if the config file exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		// If config file doesn't exist, create an empty one
		emptyConfig := &Config{
			FolderPaths:        []string{},
			SelectedSandbox:    "DefaultBox",
			AvailableSandboxes: []string{"DefaultBox", "__ask__"},
		}
		data, err := json.MarshalIndent(emptyConfig, "", "  ")
		if err != nil {
			return fmt.Errorf("failed to create empty config: %v", err)
		}
		if err := os.WriteFile(configPath, data, 0644); err != nil {
			return fmt.Errorf("failed to write empty config: %v", err)
		}
	}

	// Open the config file with the default text editor on Windows
	cmd := exec.Command("cmd", "/c", "start", "", configPath)
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to open config file: %v", err)
	}

	return nil
}

// OpenFolder opens a subfolder and returns the updated state
func (a *App) OpenFolder(folderPath string) (*AppState, error) {
	if err := a.fileManager.ValidateDirectory(folderPath); err != nil {
		return nil, fmt.Errorf("invalid folder: %v", err)
	}

	if err := a.configManager.SetCurrentFolder(folderPath); err != nil {
		return nil, err
	}

	return a.GetAppState(), nil
}

// GoBack navigates to the parent folder if possible
func (a *App) GoBack() (*AppState, error) {
	config := a.configManager.GetConfig()
	if config.CurrentFolder == "" {
		return a.GetAppState(), nil
	}

	parentDir := filepath.Dir(config.CurrentFolder)
	if parentDir == config.CurrentFolder {
		// Already at root (e.g., C:\ or D:\)
		return a.GetAppState(), nil
	}

	// Check if parent directory exists and is accessible
	if err := a.fileManager.ValidateDirectory(parentDir); err != nil {
		return nil, fmt.Errorf("cannot go back: %v", err)
	}

	// Set current folder to parent directory
	if err := a.configManager.SetCurrentFolder(parentDir); err != nil {
		return nil, err
	}

	return a.GetAppState(), nil
}

// CanGoBack checks if it's possible to navigate to the parent folder
func (a *App) CanGoBack() bool {
	config := a.configManager.GetConfig()
	if config.CurrentFolder == "" {
		return false
	}

	parentDir := filepath.Dir(config.CurrentFolder)
	if parentDir == config.CurrentFolder {
		return false // Already at root
	}

	// Check if parent directory exists and is accessible
	if err := a.fileManager.ValidateDirectory(parentDir); err != nil {
		return false
	}

	return true
}

// OpenSandboxieManager opens the Sandboxie Manager (SandMan.exe)
func (a *App) OpenSandboxieManager() error {
	return a.sandboxieManager.OpenSandboxieManager()
}
