# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Wails v2.11.0 application for Windows that provides a better start menu for Sandboxie. It allows users to:
- Select folders containing executable programs
- Persistently save folder selections in `%APPDATA%\SandboxieStartMenu\config.json`
- Display executable files (.exe, .bat, .cmd) from selected folders
- Launch programs in Sandboxie sandboxes with configurable sandbox selection
- Manage multiple sandboxes including the special `__ask__` option for runtime selection

## Architecture

### Backend (Go)
- **app.go**: Main application struct with Wails bindings - exposes methods to frontend
- **types.go**: Data structures (FileInfo, AppState, LaunchRequest, LaunchResponse)
- **config.go**: Configuration management with JSON persistence in user's AppData
- **sandboxie.go**: Sandboxie integration via Start.exe command line interface
- **filemanager.go**: File system operations and executable file filtering
- **main.go**: Wails application entry point

### Frontend (Vanilla JS + CSS)
- **main.js**: Main application logic with UI rendering and backend communication
- **app.css**: Styling for the application UI
- **style.css**: Base styles (minimal)

### Key Integration Patterns
1. **Frontend-Backend Communication**: Functions imported from `../wailsjs/go/main/App`
2. **Configuration Persistence**: JSON stored in `%APPDATA%\SandboxieStartMenu\config.json`
3. **Path Handling**: Windows paths with backslash escaping for HTML attributes
4. **Global Function Exposure**: Functions exposed to `window` for HTML `onclick` handlers

## Development Commands

### Build and Run
```bash
# Live development with hot reload
wails dev

# Production build
wails build

# Clean production build
wails build -clean
```

### Frontend Development
```bash
# Install frontend dependencies
npm install

# Build frontend only
npm run build

# Dev server only (for browser testing)
npm run dev
```

### Build Output
- Executable: `build/bin/SandboxieStartMenu.exe`
- Wails generates bindings in `frontend/wailsjs/go/main/App.js`

## Key Implementation Details

### Sandboxie Integration
- Uses `Start.exe` command line interface with `/box:` parameter
- Supports `__ask__` special value for runtime sandbox selection dialog
- Searches common Sandboxie installation paths:
  - `C:\Program Files\Sandboxie-Plus\Start.exe`
  - `C:\Program Files\Sandboxie\Start.exe`
  - `C:\Program Files (x86)\Sandboxie\Start.exe`

### Configuration Structure
```json
{
  "folderPaths": ["C:\\Program Files", "C:\\Windows"],
  "currentFolder": "C:\\Program Files",
  "selectedSandbox": "DefaultBox",
  "availableSandboxes": ["DefaultBox", "__ask__", "TestBox"]
}
```

### Path Escaping
- **Frontend**: `escapeFolderPath()` converts `\` to `/` for HTML attributes
- **Backend**: `unescapeFolderPath()` converts `/` back to `\` for Windows paths
- Required to avoid JavaScript syntax errors with backslashes in template literals

### Error Handling
- Frontend uses `alert()` for user feedback (success/error)
- Backend returns structured errors with Go error wrapping
- Console logging for debugging in both frontend and backend

## Common Issues and Solutions

1. **"Add Folder" not working**: Uses PowerShell folder picker dialog instead of Windows API
2. **JavaScript syntax errors**: Path escaping required for Windows paths in template literals
3. **Function not defined**: Ensure functions are exposed to `window` before `init()` call
4. **Sandboxie not detected**: Verify Sandboxie installation in standard paths

## Project Structure
```
SandboxieStartMenu/
├── app.go                 # Main application logic
├── config.go              # Configuration management
├── filemanager.go         # File operations
├── sandboxie.go           # Sandboxie integration
├── types.go               # Data structures
├── main.go                # Wails entry point
├── wails.json             # Wails configuration
├── go.mod                 # Go dependencies
├── frontend/
│   ├── src/
│   │   ├── main.js        # Frontend application logic
│   │   ├── app.css        # Application styling
│   │   └── style.css      # Base styles
│   ├── package.json       # Frontend dependencies
│   └── wailsjs/           # Auto-generated bindings
└── build/
    └── bin/
        └── SandboxieStartMenu.exe  # Built executable
```

## Notes
- Windows-only application targeting Sandboxie users
- No unit tests currently implemented
- Configuration is user-specific (per Windows user account)
- Application requires Sandboxie to be installed for full functionality