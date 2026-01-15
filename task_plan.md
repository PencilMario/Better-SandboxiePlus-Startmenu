# Task Plan: Sandboxie Start Menu App

## Goal
Build a user-friendly application that allows users to select a folder, display files from that folder in a menu, and launch them in Sandboxie with persistent folder configuration and quick switching capabilities.

## Phases
- [x] Phase 1: Plan architecture and select technology stack
- [x] Phase 2: Initialize Wails project and scaffold structure
- [x] Phase 3: Implement backend - configuration management and file listing
- [x] Phase 4: Implement backend - Sandboxie integration
- [x] Phase 5: Implement frontend - UI layout and folder selection
- [x] Phase 6: Implement frontend - file menu and quick switching
- [x] Phase 7: Build application successfully
- [ ] Phase 8: Create installer and packaging 
- [ ] Phase 9: Testing and refinement

## Key Questions
1. Which technology stack to use? (Electron, Qt, Go GUI, or Node.js desktop?)
2. Where to store persistent configuration (folder paths)?
3. How to handle folder quick switching? (dropdown, buttons, hotkeys?)
4. Should we support multiple sandbox instances?
5. What file types to display and filter?

## Decisions Made
- **Tech Stack**: Go + Wails - lightweight, single executable, native Windows support
- **Sandbox Support**: Multiple boxes with user selection capability
- **File Filtering**: Executables only (.exe, .bat, .cmd)

## Errors Encountered
- (None yet)

## Status
**Currently in Phase 8** - Installer and documentation created, ready for testing
