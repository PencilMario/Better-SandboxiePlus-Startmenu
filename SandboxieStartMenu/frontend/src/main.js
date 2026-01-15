import './style.css';
import './app.css';

import {
    GetAppState,
    SelectFolder,
    SetCurrentFolder,
    RemoveFolder,
    SetSelectedSandbox,
    LaunchProgram,
    IsSandboxieAvailable,
    OpenFolderDialog,
    AddAvailableSandbox,
    RemoveAvailableSandbox,
    GetAvailableSandboxes,
    GetFileIcon
} from '../wailsjs/go/main/App';

let appState = null;

// Initialize the app
async function init() {
    try {
        const available = await IsSandboxieAvailable();
        if (!available) {
            showError('Sandboxie is not installed. Please install Sandboxie first.');
            return;
        }

        await loadAppState();
        renderUI();
    } catch (err) {
        console.error('Initialization error:', err);
        showError('Failed to initialize application');
    }
}

// Load app state from backend
async function loadAppState() {
    try {
        appState = await GetAppState();
    } catch (err) {
        console.error('Error loading app state:', err);
        throw err;
    }
}

// Render the main UI
function renderUI() {
    const app = document.querySelector('#app');
    app.innerHTML = `
        <div class="container">
            <header class="header">
                <h1>Sandboxie Start Menu</h1>
            </header>

            <div class="main-content">
                <aside class="sidebar">
                    <div class="sidebar-section">
                        <h3>Folders</h3>
                        <div class="folder-list" id="folderList"></div>
                        <button class="btn btn-primary" onclick="openFolderDialog()">+ Add Folder</button>
                    </div>

                    <div class="sidebar-section">
                        <h3>Sandbox</h3>
                        <select id="sandboxSelect" onchange="changeSandbox()">
                        </select>
                    </div>

                    <div class="sidebar-section">
                        <h3>Manage Sandboxes</h3>
                        <div class="sandbox-list" id="sandboxList"></div>
                        <div class="add-sandbox-form">
                            <input type="text" id="newSandboxInput" placeholder="New sandbox name" class="sandbox-input">
                            <button class="btn btn-primary" onclick="addSandbox()">+ Add</button>
                        </div>
                    </div>
                </aside>

                <main class="content">
                    <div class="current-folder" id="currentFolder"></div>
                    <div class="file-list" id="fileList"></div>
                </main>
            </div>
        </div>
    `;

    renderFolderList();
    renderSandboxSelect();
    renderSandboxList();
    renderCurrentFolder();
    renderFileList();
}

// Helper function to escape folder path for HTML attributes
function escapeFolderPath(folderPath) {
    if (!folderPath) return '';
    // Replace backslashes with forward slashes to avoid escape issues
    return folderPath.replace(/\\/g, '/');
}

// Helper function to unescape folder path (convert forward slashes back to backslashes)
function unescapeFolderPath(folderPath) {
    if (!folderPath) return '';
    // Convert forward slashes back to backslashes for Windows paths
    return folderPath.replace(/\//g, '\\');
}

// Render folder list
function renderFolderList() {
    const folderList = document.getElementById('folderList');
    folderList.innerHTML = '';

    if (!appState.folderPaths || appState.folderPaths.length === 0) {
        folderList.innerHTML = '<p class="empty-message">No folders added yet</p>';
        return;
    }

    appState.folderPaths.forEach(folder => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        if (folder === appState.currentFolder) {
            folderItem.classList.add('active');
        }

        const folderName = folder.split('\\').pop() || folder;
        const escapedPath = escapeFolderPath(folder);
        folderItem.innerHTML = `
            <span class="folder-name" onclick="selectFolder('${escapedPath}')">
                ${folderName}
            </span>
            <button class="btn-remove" onclick="removeFolder('${escapedPath}')">×</button>
        `;
        folderList.appendChild(folderItem);
    });
}

// Render sandbox select
function renderSandboxSelect() {
    const select = document.getElementById('sandboxSelect');
    select.innerHTML = '';

    if (!appState.availableSandboxes || appState.availableSandboxes.length === 0) {
        select.innerHTML = '<option>DefaultBox</option>';
        return;
    }

    appState.availableSandboxes.forEach(sandbox => {
        const option = document.createElement('option');
        option.value = sandbox;
        option.textContent = sandbox;
        if (sandbox === appState.selectedSandbox) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// Render sandbox list for management
function renderSandboxList() {
    const sandboxList = document.getElementById('sandboxList');
    sandboxList.innerHTML = '';

    if (!appState.availableSandboxes || appState.availableSandboxes.length === 0) {
        sandboxList.innerHTML = '<p class="empty-message">No sandboxes added</p>';
        return;
    }

    appState.availableSandboxes.forEach(sandbox => {
        const sandboxItem = document.createElement('div');
        sandboxItem.className = 'sandbox-item';
        sandboxItem.innerHTML = `
            <span class="sandbox-name">${sandbox} ${sandbox === '__ask__' ? '(Ask at runtime)' : ''}</span>
            <button class="btn-remove" onclick="removeSandbox('${sandbox}')" ${sandbox === '__ask__' ? 'disabled title="Cannot remove __ask__ option"' : ''}>×</button>
        `;
        sandboxList.appendChild(sandboxItem);
    });
}

// Render current folder info
function renderCurrentFolder() {
    const currentFolderDiv = document.getElementById('currentFolder');
    if (!appState.currentFolder) {
        currentFolderDiv.innerHTML = '<p class="empty-message">Select a folder to view files</p>';
        return;
    }

    currentFolderDiv.innerHTML = `<p class="folder-path">[Folder] ${appState.currentFolder}</p>`;
}

// Get icon for file
function getFileIcon(file) {
    // If file has icon data, use it
    if (file.icon && file.icon !== '') {
        return `<img src="${file.icon}" alt="${file.name}" class="file-icon-img">`;
    }

    // Otherwise use Unicode icon based on file type
    let iconChar;
    switch (file.type) {
        case 'exe':
            iconChar = '⚙️'; // Gear icon for executables
            break;
        case 'lnk':
            iconChar = '🔗'; // Link icon for shortcuts
            break;
        case 'bat':
        case 'cmd':
            iconChar = '📝'; // Memo icon for scripts
            break;
        default:
            iconChar = '📄'; // Document icon for other files
    }
    return `<div class="file-icon-char">${iconChar}</div>`;
}

// Render file list
function renderFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    if (!appState.files || appState.files.length === 0) {
        fileList.innerHTML = '<p class="empty-message">No executable files in this folder</p>';
        return;
    }

    appState.files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.setAttribute('data-file-path', escapeFolderPath(file.path));
        const escapedPath = escapeFolderPath(file.path);
        const fileIcon = getFileIcon(file);
        fileItem.innerHTML = `
            <div class="file-icon-container">
                ${fileIcon}
            </div>
            <span class="file-name">${file.name}</span>
            <button class="btn btn-launch" onclick="launchFile('${escapedPath}')">
                Launch
            </button>
        `;
        fileList.appendChild(fileItem);
    });

    // Load icons asynchronously after rendering
    loadIconsAsync();
}

// Load icons asynchronously for all files
async function loadIconsAsync() {
    const fileItems = document.querySelectorAll('.file-item');

    for (const fileItem of fileItems) {
        const escapedPath = fileItem.getAttribute('data-file-path');
        const originalPath = unescapeFolderPath(escapedPath);

        try {
            const iconData = await GetFileIcon(originalPath);
            if (iconData && iconData !== '') {
                const iconContainer = fileItem.querySelector('.file-icon-container');
                if (iconContainer) {
                    iconContainer.innerHTML = `<img src="${iconData}" alt="icon" class="file-icon-img">`;
                }
            }
        } catch (err) {
            console.error('Error loading icon for', originalPath, ':', err);
            // Keep the Unicode icon as fallback
        }
    }
}

// Select a folder
async function selectFolder(folderPath) {
    try {
        const originalPath = unescapeFolderPath(folderPath);
        appState = await SetCurrentFolder(originalPath);
        renderUI();
    } catch (err) {
        console.error('Error selecting folder:', err);
        showError('Failed to select folder');
    }
}

// Remove a folder
async function removeFolder(folderPath) {
    const originalPath = unescapeFolderPath(folderPath);
    if (!confirm(`Remove folder "${originalPath}" from the list?`)) {
        return;
    }

    try {
        appState = await RemoveFolder(originalPath);
        renderUI();
        showSuccess(`Folder removed: ${originalPath}`);
    } catch (err) {
        console.error('Error removing folder:', err);
        showError(`Failed to remove folder: ${err.message || err}`);
    }
}

// Add a sandbox
async function addSandbox() {
    const input = document.getElementById('newSandboxInput');
    const sandbox = input.value.trim();

    if (!sandbox) {
        showError('Please enter a sandbox name');
        return;
    }

    if (sandbox.includes(':')) {
        showError('Sandbox name cannot contain colons');
        return;
    }

    try {
        appState = await AddAvailableSandbox(sandbox);
        renderUI();
        input.value = '';
        showSuccess(`Sandbox "${sandbox}" added`);
    } catch (err) {
        console.error('Error adding sandbox:', err);
        showError(`Failed to add sandbox: ${err.message || err}`);
    }
}

// Remove a sandbox
async function removeSandbox(sandbox) {
    if (sandbox === '__ask__') {
        showError('Cannot remove the "__ask__" option');
        return;
    }

    if (!confirm(`Remove sandbox "${sandbox}" from the list?`)) {
        return;
    }

    try {
        appState = await RemoveAvailableSandbox(sandbox);
        renderUI();
        showSuccess(`Sandbox "${sandbox}" removed`);
    } catch (err) {
        console.error('Error removing sandbox:', err);
        showError(`Failed to remove sandbox: ${err.message || err}`);
    }
}

// Change sandbox
async function changeSandbox() {
    const select = document.getElementById('sandboxSelect');
    const sandbox = select.value;

    try {
        appState = await SetSelectedSandbox(sandbox);
        renderUI();
    } catch (err) {
        console.error('Error changing sandbox:', err);
        showError('Failed to change sandbox');
    }
}

// Launch a file
async function launchFile(filePath) {
    try {
        const originalPath = unescapeFolderPath(filePath);
        console.log('Launching file:', originalPath);
        const response = await LaunchProgram(originalPath);
        if (response.success) {
            showSuccess(`Program launched successfully (PID: ${response.pid})`);
        } else {
            showError(`Failed to launch program: ${response.message}`);
        }
    } catch (err) {
        console.error('Error launching file:', err);
        showError(`Failed to launch program: ${err.message || err}`);
    }
}

// Open folder dialog
async function openFolderDialog() {
    console.log('openFolderDialog called');
    try {
        console.log('Calling OpenFolderDialog backend method...');
        const folderPath = await OpenFolderDialog();
        console.log('Received folderPath:', folderPath);

        if (folderPath && folderPath !== "") {
            console.log('Adding folder:', folderPath);
            appState = await SelectFolder(folderPath);
            renderUI();
            showSuccess(`Folder added: ${folderPath}`);
        } else {
            console.log('No folder path returned');
        }
    } catch (err) {
        console.error('Error opening folder dialog:', err);
        showError(`Failed to open folder dialog: ${err.message || err}`);
    }
}

// Show error message
function showError(message) {
    alert(`Error: ${message}`);
}

// Show success message
function showSuccess(message) {
    alert(`Success: ${message}`);
}

// Expose functions to global scope for HTML onclick handlers
window.openFolderDialog = openFolderDialog;
window.selectFolder = selectFolder;
window.removeFolder = removeFolder;
window.changeSandbox = changeSandbox;
window.launchFile = launchFile;
window.addSandbox = addSandbox;
window.removeSandbox = removeSandbox;

// Initialize app on load
init();
