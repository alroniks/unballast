# Unballast: Vision & Strategy

## Positioning
**"A quiet developer workspace cleaner."**

## The Problem
Developers accumulate massive, forgotten `node_modules`, `target`, and `build` folders across their projects, unnecessarily consuming disk space.

## The Solution
A blazing-fast utility application built with Rust and Tauri that silently monitors for bloated developer dependencies and allows for quick, manual, or automated cleanup.

### Business Model: Open Core (Free CLI / Paid UI)
We are adopting a freemium / open-core model to drive organic adoption among developers while monetizing the convenience of the GUI:
- **Free CLI (Open Source):** Distributed via Homebrew. The `unballast-core` engine is 100% free. This drives developer adoption, GitHub stars, and organic marketing.
- **Paid UI ($9 Lifetime for 2 Macs):** A highly polished, native macOS tray application built with Tauri. Handled via a Merchant of Record (e.g., Lemon Squeezy or Gumroad).
- **Freemium App Trial:** The UI app is free to download. It will scan and show the user how much space they can save for free. Users are granted **1 Free Clean** (or manual single-folder cleans) to prove value. Full bulk-cleaning and automation features require the $9 Pro license.

## Feature Split

### ✅ Free (Core Functions - CLI & Unlicensed UI)
- **Deep Scan:** Blazing fast parallel scanning of workspaces.
- **Metrics:** See exactly how much space is being wasted.
- **Manual Clean:** Clean one folder at a time, or use the 1x Free Bulk Clean.
- **Safe Deletion:** Defaults to moving folders to the macOS Bin (via `trash` crate).

### 💎 Pro (Paid UI Features - $9)
- **Unlimited Bulk Cleans:** Clean all 50+ projects with a single click.
- **Automation & Background Watcher:** Scheduled scans (daily/weekly) and background discovery of new workspaces.
- **Smart Rules:** Auto-clean projects that haven't been opened in N days, or keep only the X most recent dependency folders.
- **Advanced Insights & History:** Track space saved over time, top space-eaters, and visual trend charts.
- **Menu Bar Quick Actions:** Instantly free up space without opening the full UI.

## Technical Architecture
- **Framework:** Tauri (React/Vite Frontend)
- **Backend (Rust):** File system scanning (`jwalk` / `ignore`), computing totals, and moving to trash (`trash` crate).
- **Security:** `keyring` crate for securely storing license keys and trial usage limits in the macOS Keychain.
- **Methodology:** BMAD Method (Analysis, Planning, Solutioning, Implementation) mapped into a streamlined `docs/` structure.
