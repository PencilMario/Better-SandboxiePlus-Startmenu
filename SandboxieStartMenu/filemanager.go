package main

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// FileManager handles file operations
type FileManager struct{}

// NewFileManager creates a new file manager
func NewFileManager() *FileManager {
	return &FileManager{}
}

// GetDirectoryContents returns all folders and executable files in the given directory
func (fm *FileManager) GetDirectoryContents(dirPath string) ([]FileInfo, error) {
	var folders []FileInfo
	var files []FileInfo

	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, err
	}

	for _, entry := range entries {
		name := entry.Name()
		fullPath := filepath.Join(dirPath, name)

		if entry.IsDir() {
			// Add folder
			folders = append(folders, FileInfo{
				Name:  name,
				Path:  fullPath,
				Type:  "folder",
				Icon:  "",
				IsDir: true,
			})
		} else {
			// Check if it's an executable file
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
				Name:  name,
				Path:  fullPath,
				Type:  fileType,
				Icon:  "", // 延迟加载：不立即提取图标
				IsDir: false,
			})
		}
	}

	// Sort folders by name (case-insensitive)
	sort.Slice(folders, func(i, j int) bool {
		return strings.ToLower(folders[i].Name) < strings.ToLower(folders[j].Name)
	})

	// Sort files by name (case-insensitive)
	sort.Slice(files, func(i, j int) bool {
		return strings.ToLower(files[i].Name) < strings.ToLower(files[j].Name)
	})

	// Combine: folders first, then files
	return append(folders, files...), nil
}

// GetExecutableFiles returns all executable files in the given directory (for backward compatibility)
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
			Name:  name,
			Path:  filepath.Join(dirPath, name),
			Type:  fileType,
			Icon:  "", // 延迟加载：不立即提取图标
			IsDir: false,
		})
	}

	// Sort files by name (case-insensitive)
	sort.Slice(files, func(i, j int) bool {
		return strings.ToLower(files[i].Name) < strings.ToLower(files[j].Name)
	})

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