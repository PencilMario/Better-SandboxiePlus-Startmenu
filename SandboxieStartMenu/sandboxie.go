package main

import (
	"fmt"
	"os"
	"os/exec"
)

// SandboxieManager handles Sandboxie operations
type SandboxieManager struct {
	startExePath string
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
			return &SandboxieManager{startExePath: path}
		}
	}

	return &SandboxieManager{startExePath: ""}
}

// IsAvailable checks if Sandboxie is installed
func (sm *SandboxieManager) IsAvailable() bool {
	return sm.startExePath != ""
}

// GetStartExePath returns the path to Start.exe
func (sm *SandboxieManager) GetStartExePath() string {
	return sm.startExePath
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
