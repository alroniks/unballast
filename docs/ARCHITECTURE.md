# Architecture

## High-Level System Context
The application, **Unballast**, is a lightweight macOS utility designed to find and remove heavy dependency directories (like `node_modules` or `vendor`) to free up disk space. 

To support both power users (via Homebrew) and visual users, the system is designed with a **"Core Library"** architecture, allowing both a CLI and a GUI to share the exact same underlying logic.

The system is cleanly divided into three boundaries:
1. **Core Library (Rust `src-tauri/src/core/`):** A pure, decoupled library that interacts with the file system for recursive scanning, size computation, and safe deletion to the macOS Trash. It knows nothing about UI or Tauri.
2. **Interfaces (Consumers of the Core):**
   - **CLI Binary (`src-tauri/src/bin/cli.rs`):** A lightweight terminal interface ideal for Homebrew distribution and power users.
   - **Tauri Shell (`src-tauri/src/main.rs`):** Manages the application lifecycle, IPC (Inter-Process Communication), System Tray icon, and the frameless popover window for the visual application.
3. **User Interface (React + Vite):** A minimalist frontend consumed by the Tauri shell that renders the status of located folders, gamified metrics, and settings.

## Design Principles
- **Performance First:** File system traversal can be notoriously slow. We rely on Rust (`jwalk`) to offload I/O operations from the main UI thread.
- **Safety:** We do not perform irreversible deletions (`rm -rf`) by default. We interact with the native macOS Trash via the `trash` crate.
- **Decoupled Architecture:** The file scanning and deletion logic must be completely independent of the Tauri framework to ensure the CLI remains standalone and lightweight.
- **Unobtrusive:** The GUI operates quietly in the background as an Accessory app (`LSUIElement`). It does not pollute the Dock or the `Cmd+Tab` switcher.

## Data Flow
### GUI Flow
1. **Trigger:** The React UI calls an IPC command (e.g., `invoke('scan_directories')`).
2. **Execution:** The Tauri command delegates to the Rust Core Library, spawning a background thread to walk the directory tree.
3. **Response:** The Core streams results back through Tauri to the UI asynchronously (via events).
4. **Action:** User clicks "Clean", UI invokes `invoke('trash_directory', { path })`. Core executes the OS-level move.

### CLI Flow
1. **Trigger:** User runs `unballast scan ~/Dev` in the terminal.
2. **Execution:** The CLI binary calls the exact same Rust Core Library functions.
3. **Response:** Results are printed directly to `stdout`.

## Storage & State
- **User Settings:** Kept in a local `.json` file managed by `tauri-plugin-store`.
- **Metrics:** Also persisted locally via the store. No cloud synchronization is required for V1.
