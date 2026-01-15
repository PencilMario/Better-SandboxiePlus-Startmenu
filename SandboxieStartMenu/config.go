package main

import (
	"encoding/json"
	"os"
	"path/filepath"
)

// Config holds the application configuration
type Config struct {
	FolderPaths        []string `json:"folderPaths"`
	CurrentFolder      string   `json:"currentFolder"`
	SelectedSandbox    string   `json:"selectedSandbox"`
	AvailableSandboxes []string `json:"availableSandboxes"`
}

// ConfigManager handles loading and saving configuration
type ConfigManager struct {
	configPath string
	config     *Config
}

// NewConfigManager creates a new configuration manager
func NewConfigManager() *ConfigManager {
	configDir := getConfigDir()
	configPath := filepath.Join(configDir, "config.json")

	cm := &ConfigManager{
		configPath: configPath,
		config:     &Config{},
	}

	cm.Load()
	return cm
}

// getConfigDir returns the application config directory
func getConfigDir() string {
	appData := os.Getenv("APPDATA")
	if appData == "" {
		appData = os.Getenv("HOME")
	}
	configDir := filepath.Join(appData, "SandboxieStartMenu")
	os.MkdirAll(configDir, 0755)
	return configDir
}

// Load loads configuration from disk
func (cm *ConfigManager) Load() error {
	data, err := os.ReadFile(cm.configPath)
	if err != nil {
		if os.IsNotExist(err) {
			cm.config = &Config{
				FolderPaths:        []string{},
				SelectedSandbox:    "DefaultBox",
				AvailableSandboxes: []string{"DefaultBox", "__ask__"},
			}
			return nil
		}
		return err
	}

	if err := json.Unmarshal(data, cm.config); err != nil {
		return err
	}

	// Ensure DefaultBox and __ask__ are always in the list
	cm.ensureDefaultSandboxes()
	return nil
}

// Save saves configuration to disk
func (cm *ConfigManager) Save() error {
	data, err := json.MarshalIndent(cm.config, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(cm.configPath, data, 0644)
}

// GetConfig returns the current configuration
func (cm *ConfigManager) GetConfig() *Config {
	return cm.config
}

// ensureDefaultSandboxes ensures DefaultBox and __ask__ are always in the list
func (cm *ConfigManager) ensureDefaultSandboxes() {
	// Ensure DefaultBox exists
	hasDefaultBox := false
	hasAsk := false

	for _, s := range cm.config.AvailableSandboxes {
		if s == "DefaultBox" {
			hasDefaultBox = true
		}
		if s == "__ask__" {
			hasAsk = true
		}
	}

	if !hasDefaultBox {
		cm.config.AvailableSandboxes = append([]string{"DefaultBox"}, cm.config.AvailableSandboxes...)
	}
	if !hasAsk {
		cm.config.AvailableSandboxes = append(cm.config.AvailableSandboxes, "__ask__")
	}
}

// AddFolderPath adds a folder path to the configuration
func (cm *ConfigManager) AddFolderPath(path string) error {
	for _, p := range cm.config.FolderPaths {
		if p == path {
			return nil // Already exists
		}
	}
	cm.config.FolderPaths = append(cm.config.FolderPaths, path)
	cm.config.CurrentFolder = path
	return cm.Save()
}

// RemoveFolderPath removes a folder path from the configuration
func (cm *ConfigManager) RemoveFolderPath(path string) error {
	for i, p := range cm.config.FolderPaths {
		if p == path {
			cm.config.FolderPaths = append(cm.config.FolderPaths[:i], cm.config.FolderPaths[i+1:]...)
			if cm.config.CurrentFolder == path && len(cm.config.FolderPaths) > 0 {
				cm.config.CurrentFolder = cm.config.FolderPaths[0]
			}
			return cm.Save()
		}
	}
	return nil
}

// SetCurrentFolder sets the current folder
func (cm *ConfigManager) SetCurrentFolder(path string) error {
	cm.config.CurrentFolder = path
	return cm.Save()
}

// SetSelectedSandbox sets the selected sandbox
func (cm *ConfigManager) SetSelectedSandbox(sandbox string) error {
	cm.config.SelectedSandbox = sandbox
	return cm.Save()
}

// AddAvailableSandbox adds a sandbox to the available sandboxes list
func (cm *ConfigManager) AddAvailableSandbox(sandbox string) error {
	// Check if sandbox already exists
	for _, s := range cm.config.AvailableSandboxes {
		if s == sandbox {
			return nil // Already exists
		}
	}

	cm.config.AvailableSandboxes = append(cm.config.AvailableSandboxes, sandbox)
	return cm.Save()
}

// RemoveAvailableSandbox removes a sandbox from the available sandboxes list
func (cm *ConfigManager) RemoveAvailableSandbox(sandbox string) error {
	if sandbox == "__ask__" || sandbox == "DefaultBox" {
		// Don't allow removing the special __ask__ option or DefaultBox
		return nil
	}

	newSandboxes := []string{}
	for _, s := range cm.config.AvailableSandboxes {
		if s != sandbox {
			newSandboxes = append(newSandboxes, s)
		}
	}

	cm.config.AvailableSandboxes = newSandboxes
	return cm.Save()
}

// GetAvailableSandboxes returns the list of available sandboxes
func (cm *ConfigManager) GetAvailableSandboxes() []string {
	return cm.config.AvailableSandboxes
}
