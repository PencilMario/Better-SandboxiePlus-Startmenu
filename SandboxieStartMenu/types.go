package main

// FileInfo represents a file in the folder
type FileInfo struct {
	Name string `json:"name"`
	Path string `json:"path"`
	Type string `json:"type"` // "exe", "bat", "cmd", "lnk"
	Icon string `json:"icon,omitempty"` // Base64 encoded icon or empty
}

// AppState represents the current application state
type AppState struct {
	FolderPaths     []string `json:"folderPaths"`
	CurrentFolder   string   `json:"currentFolder"`
	Files           []FileInfo `json:"files"`
	SelectedSandbox string   `json:"selectedSandbox"`
	AvailableSandboxes []string `json:"availableSandboxes"`
}

// LaunchRequest represents a request to launch a program
type LaunchRequest struct {
	FilePath string `json:"filePath"`
	Sandbox  string `json:"sandbox"`
}

// LaunchResponse represents the response from launching a program
type LaunchResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	PID     int    `json:"pid"`
}
