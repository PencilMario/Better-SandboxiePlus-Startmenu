package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// SandboxieManager handles Sandboxie operations
type SandboxieManager struct {
	startExePath  string
	sbieIniPath   string
	commandOutput func(name string, arg ...string) ([]byte, error)
}

// NewSandboxieManager creates a new Sandboxie manager
func NewSandboxieManager() *SandboxieManager {
	// Try common Sandboxie installation paths
	paths := []string{
		"C:\\Program Files\\Sandboxie-Plus\\Start.exe",
		"C:\\Program Files\\Sandboxie\\Start.exe",
		"C:\\Program Files (x86)\\Sandboxie\\Start.exe",
	}

	for _, path := range paths {
		if _, err := os.Stat(path); err == nil {
			startDir := filepath.Dir(path)
			sbieIniPath := filepath.Join(startDir, "SbieIni.exe")
			if _, err := os.Stat(sbieIniPath); err != nil {
				sbieIniPath = ""
			}

			return &SandboxieManager{
				startExePath: path,
				sbieIniPath:  sbieIniPath,
				commandOutput: func(name string, arg ...string) ([]byte, error) {
					return exec.Command(name, arg...).Output()
				},
			}
		}
	}

	return &SandboxieManager{
		startExePath: "",
		commandOutput: func(name string, arg ...string) ([]byte, error) {
			return exec.Command(name, arg...).Output()
		},
	}
}

// IsAvailable checks if Sandboxie is installed
func (sm *SandboxieManager) IsAvailable() bool {
	return sm.startExePath != ""
}

// GetStartExePath returns the path to Start.exe
func (sm *SandboxieManager) GetStartExePath() string {
	return sm.startExePath
}

// GetConfiguredSandboxes returns sandbox names from Sandboxie's own configuration.
func (sm *SandboxieManager) GetConfiguredSandboxes() ([]string, error) {
	if sm.sbieIniPath == "" {
		return nil, fmt.Errorf("SbieIni.exe not found")
	}

	commandOutput := sm.commandOutput
	if commandOutput == nil {
		commandOutput = func(name string, arg ...string) ([]byte, error) {
			return exec.Command(name, arg...).Output()
		}
	}

	output, err := commandOutput(sm.sbieIniPath, "query", "/boxes", "*")
	if err != nil {
		return nil, err
	}

	return parseSandboxieBoxOutput(string(output)), nil
}

func parseSandboxieBoxOutput(output string) []string {
	lines := strings.FieldsFunc(output, func(r rune) bool {
		return r == '\r' || r == '\n'
	})

	boxes := []string{}
	seen := map[string]bool{}
	for _, line := range lines {
		box := strings.TrimSpace(line)
		if box == "" || seen[box] {
			continue
		}
		seen[box] = true
		boxes = append(boxes, box)
	}

	return boxes
}

// GetSandboxRootFolders returns root folders for configured sandboxes.
func (sm *SandboxieManager) GetSandboxRootFolders() ([]SandboxFolder, error) {
	boxes, err := sm.GetConfiguredSandboxes()
	if err != nil {
		return nil, err
	}

	folders := []SandboxFolder{}
	for _, box := range boxes {
		rootPath, err := sm.querySandboxSetting(box, "FileRootPath")
		if err != nil {
			return nil, err
		}
		if rootPath == "" {
			rootPath = defaultSandboxRootPath(box)
		}
		rootPath = expandSandboxPath(rootPath, box)
		folders = append(folders, SandboxFolder{
			Sandbox: box,
			Path:    filepath.Clean(rootPath),
		})
	}

	return folders, nil
}

func (sm *SandboxieManager) querySandboxSetting(sandbox string, setting string) (string, error) {
	if sm.sbieIniPath == "" {
		return "", fmt.Errorf("SbieIni.exe not found")
	}

	commandOutput := sm.commandOutput
	if commandOutput == nil {
		commandOutput = func(name string, arg ...string) ([]byte, error) {
			return exec.Command(name, arg...).Output()
		}
	}

	output, err := commandOutput(sm.sbieIniPath, "query", sandbox, setting)
	if err != nil {
		return "", err
	}

	return strings.TrimSpace(string(output)), nil
}

func defaultSandboxRootPath(sandbox string) string {
	systemDrive := os.Getenv("SystemDrive")
	if systemDrive == "" {
		systemDrive = "C:"
	}
	return filepath.Join(systemDrive+"\\", "Sandbox", os.Getenv("USERNAME"), sandbox)
}

func expandSandboxPath(path string, sandbox string) string {
	replacements := map[string]string{
		"%SANDBOX%": sandbox,
		"%USER%":    os.Getenv("USERNAME"),
	}

	expanded := os.ExpandEnv(path)
	for placeholder, value := range replacements {
		expanded = strings.ReplaceAll(expanded, placeholder, value)
	}

	return expanded
}

// LaunchProgram launches a program in the specified sandbox
func (sm *SandboxieManager) LaunchProgram(filePath string, sandbox string) (int, error) {
	if !sm.IsAvailable() {
		return 0, fmt.Errorf("Sandboxie 未安装")
	}

	// Validate file exists
	if _, err := os.Stat(filePath); err != nil {
		return 0, fmt.Errorf("file not found: %s", filePath)
	}

	// Build command arguments
	args := []string{}
	if sandbox == "__ask__" {
		args = append(args, "/box:__ask__")
	} else {
		args = append(args, "/box:"+sandbox)
	}
	args = append(args, filePath)

	cmd := exec.Command(sm.startExePath, args...)

	// Start the process
	err := cmd.Start()
	if err != nil {
		return 0, err
	}

	return cmd.Process.Pid, nil
}

// TerminateAllPrograms terminates all programs in a sandbox
func (sm *SandboxieManager) TerminateAllPrograms(sandbox string) error {
	if !sm.IsAvailable() {
		return fmt.Errorf("Sandboxie 未安装")
	}

	cmd := exec.Command(
		sm.startExePath,
		"/box:"+sandbox,
		"/terminate",
	)

	return cmd.Run()
}

// DeleteSandboxContents deletes the contents of a sandbox
func (sm *SandboxieManager) DeleteSandboxContents(sandbox string) error {
	if !sm.IsAvailable() {
		return fmt.Errorf("Sandboxie 未安装")
	}

	cmd := exec.Command(
		sm.startExePath,
		"/box:"+sandbox,
		"delete_sandbox_silent",
	)

	return cmd.Run()
}

// OpenSandboxieManager opens the Sandboxie Manager (SandMan.exe)
func (sm *SandboxieManager) OpenSandboxieManager() error {
	if !sm.IsAvailable() {
		return fmt.Errorf("Sandboxie 未安装")
	}

	// Try to find SandMan.exe in the same directory as Start.exe
	startDir := filepath.Dir(sm.startExePath)
	sandManPath := filepath.Join(startDir, "SandMan.exe")

	// Check if SandMan.exe exists
	if _, err := os.Stat(sandManPath); err != nil {
		// Try alternative path for Sandboxie-Plus
		sandManPath = filepath.Join(startDir, "..", "SandMan.exe")
		sandManPath, _ = filepath.Abs(sandManPath)

		if _, err := os.Stat(sandManPath); err != nil {
			return fmt.Errorf("Sandboxie Manager (SandMan.exe) not found")
		}
	}

	cmd := exec.Command(sandManPath)

	// Start the process
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start Sandboxie Manager: %v", err)
	}

	return nil
}
