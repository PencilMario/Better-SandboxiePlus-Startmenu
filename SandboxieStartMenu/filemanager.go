package main

import (
	"os"
	"path/filepath"
	"strings"
)

// FileManager handles file operations
type FileManager struct{}

// NewFileManager creates a new file manager
func NewFileManager() *FileManager {
	return &FileManager{}
}

// GetExecutableFiles returns all executable files in the given directory
func (fm *FileManager) GetExecutableFiles(dirPath string) ([]FileInfo, error) {
	var files []FileInfo

	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		name := entry.Name()
		ext := strings.ToLower(filepath.Ext(name))

		var fileType string
		switch ext {
		case ".exe":
			fileType = "exe"
		case ".bat":
			fileType = "bat"
		case ".cmd":
			fileType = "cmd"
		case ".lnk":
			fileType = "lnk"
		default:
			continue // Skip non-executable files
		}

		files = append(files, FileInfo{
			Name: name,
			Path: filepath.Join(dirPath, name),
			Type: fileType,
			Icon: "", // 延迟加载：不立即提取图标
		})
	}

	return files, nil
}

// ValidateDirectory checks if the directory exists and is accessible
func (fm *FileManager) ValidateDirectory(dirPath string) error {
	info, err := os.Stat(dirPath)
	if err != nil {
		return err
	}

	if !info.IsDir() {
		return os.ErrInvalid
	}

	return nil
}