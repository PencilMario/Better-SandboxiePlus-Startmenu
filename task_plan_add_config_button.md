# Task Plan: Add Button to Open Configuration File

## Goal
Add a button to the UI that opens the configuration file (`%APPDATA%\SandboxieStartMenu\config.json`) in the default text editor when clicked.

## Phases
- [ ] Phase 1: Plan and setup
- [ ] Phase 2: Research/gather information
- [ ] Phase 3: Execute/build
- [ ] Phase 4: Review and deliver

## Key Questions
1. Where is the best place to add the button in the current UI?
2. How does the application currently handle file operations?
3. What's the best way to open a file in the default text editor on Windows?
4. How should we handle errors (e.g., file doesn't exist)?

## Decisions Made

## Errors Encountered

## Decisions Made
1. **Button Placement**: Add in Sidebar's "Manage Sandboxes" section as it's configuration-related
2. **Button Style**: Use secondary button styling (gray background) to distinguish from primary actions
3. **Icon**: Use a gear/settings icon (⚙️) or document icon (📄)
4. **Functionality**: Open config file in default text editor using Windows `start` command
5. **Error Handling**: Show toast notification if config file doesn't exist or can't be opened

## Errors Encountered

## Status
**Currently in Phase 4** - Testing the functionality