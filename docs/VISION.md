# Nodemode: Vision & Strategy

## The Problem
Developers accumulate massive, forgotten `node_modules` folders across their projects, unnecessarily consuming disk space. 

## The Solution
A lightweight, tray-based utility application built with Tauri that silently monitors for bloated dependencies and allows for quick, manual, or automated cleanup.

**Monetization Strategy:** 100% Free and Open Source (Donationware). We will rely on voluntary support (e.g., GitHub Sponsors, Ko-fi) rather than paywalling developer utility features.

## V1 Scope (Core Product)
- **Target:** Exclusively `node_modules` for now. Other platforms (e.g., `vendor`, `target`) may be considered in the future based on user feedback.
- **Smart Scanner:** Defaults to scanning the user's home directory (`~/`). Allows setting a custom root folder and excluding specific projects/directories to optimize performance.
- **Deletion Strategy:** Configurable via user settings. The user can choose between moving folders to the OS Trash (safer) or direct permanent deletion (`rm -rf`).
- **Metrics & UI:** The system tray icon/menu will show the current amount of space used by active `node_modules`. It will also track an all-time "Total Space Freed" metric. Configuration options will be available via a settings view.

## Future Features (Automation & Insights)
All future features will remain free, supported by the donationware model.
- **Background Watcher:** Automatically discover new folders using a Rust watcher (`notify` crate).
- **Automation:** Scheduled scans and auto-clean rules (e.g., remove folders older than 30 days).
- **Smart Rules:** Delete dependencies only if the project hasn't been opened for N days; keep only the latest X folders per workspace.
- **Notifications:** "You have 20GB in unused node_modules."

## Technical Architecture
- **Framework:** Tauri
- **Backend (Rust):** File system scanning (`walkdir` / `ignore`), computing totals, moving to trash (`trash` crate), tray management.
- **Frontend (Web):** Minimalist popover UI.
- **Methodology:** BMAD Method (Analysis, Planning, Solutioning, Implementation) mapped into a streamlined `docs/` structure (Tolaria-style).
