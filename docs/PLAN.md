# Unballast: Implementation Plan

Following the BMAD Phase 4 (Implementation) mapped to our Tolaria-style repository, here is the execution plan broken down by Epics.

## Epic 1: Core Backend Foundation (Rust)
**Goal:** Establish safe, high-performance file traversal and macOS Trash integration.

- [ ] **Task 1.1:** Setup Tauri project structure (`src-tauri` and UI placeholder).
- [ ] **Task 1.2:** Implement Rust multi-threaded directory scanner (investigate `jwalk`). It must find `node_modules` without descending into them.
- [ ] **Task 1.3:** Implement disk size calculation for the located directories.
- [ ] **Task 1.4:** Integrate the `trash` crate to safely move directories to the macOS Trash.
- [ ] **Task 1.5:** Write Rust unit tests for traversal logic, size calculation, and Trash operations.

## Epic 2: Tauri Application Shell & macOS Integration
**Goal:** Configure the app as a background utility invokable via the System Tray.

- [ ] **Task 2.1:** Configure macOS `LSUIElement` to run as an Accessory app (hide from Dock and Cmd+Tab).
- [ ] **Task 2.2:** Implement the System Tray icon (`TrayIcon`) in the macOS Menu Bar.
- [ ] **Task 2.3:** Integrate `tauri-plugin-positioner` to properly toggle and position a frameless popover window relative to the tray icon.
- [ ] **Task 2.4:** Wire Tray interactions (e.g., Left Click toggles popover, Right Click shows native menu with "Quit").

## Epic 3: State Management & IPC Integration
**Goal:** Persist user preferences and safely expose Rust commands to the frontend.

- [ ] **Task 3.1:** Set up `tauri-plugin-store` to persist user-configured root paths (default `~/`) and exclusion rules.
- [ ] **Task 3.2:** Persist the gamified "Total Space Freed" metric.
- [ ] **Task 3.3:** Create and expose Tauri IPC commands (`scan_folders`, `trash_folder`, `get_stats`).
- [ ] **Task 3.4:** Handle macOS permission gracefully (e.g., what happens if `~/Downloads` is protected without Full Disk Access).

## Epic 4: Frontend UI & Performance Tuning
**Goal:** Deliver a fast, minimalist user interface to display metrics and trigger actions.

- [ ] **Task 4.1:** Scaffold React/Vite frontend using the existing UI design system (if applicable, else standard Tailwind/Tremor).
- [ ] **Task 4.2:** Implement the "Dashboard" view: List found folders, display disk sizes, and provide a "Clean" button per item.
- [ ] **Task 4.3:** Implement the "Settings" view: Configure scan root and exclusions.
- [ ] **Task 4.4:** Display the lifetime "Total Space Freed" prominently.
- [ ] **Task 4.5:** Finalize animations and popover focus state handling.

## Epic 5: E2E Testing (Playwright)
**Goal:** Ensure the app works end-to-end reliably, inspired by Tolaria's testing setup.

- [ ] **Task 5.1:** Setup Playwright for Tauri.
- [ ] **Task 5.2:** Write Smoke Tests (App opens, Tray is responsive).
- [ ] **Task 5.3:** Write Integration Tests (Mocking file system, verifying UI updates when folders are deleted).

## Epic 6: AI Tooling & Things 3 Integration
**Goal:** Replace legacy Claude/Todoist workflows with native Gemini CLI skills that integrate directly with macOS Things 3.

- [ ] **Task 6.1:** Analyze the existing `.claude/commands/` (e.g., `laputa-next-task`, `laputa-done`) and map their workflows to Gemini CLI skill structures.
- [ ] **Task 6.2:** Develop an AppleScript/JXA script to fetch the current active task and complete tasks from Things 3 locally.
- [ ] **Task 6.3:** Use the `skill-creator` to generate new native Gemini CLI skills for task fetching and task completion.
- [ ] **Task 6.4:** Document the new skills and their triggers in `AGENTS.md`.
- [ ] **Task 6.5:** Safely remove the legacy `.claude` configuration folder once the skills are tested.
