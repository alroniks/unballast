# ADR 0004: Application Lifecycle and Windowing Model

## Status
Accepted

## Context
Unballast is a developer utility designed to run silently in the background and monitor disk space. Traditional windowed applications clutter the macOS Dock and the `Cmd+Tab` app switcher, which is undesirable for a "set and forget" utility.

## Decision
We will configure the Tauri application as a macOS Accessory app by setting the `LSUIElement` key to `true` in the `Info.plist`. 

The application lifecycle will be managed entirely via the macOS Menu Bar:
1. **System Tray:** A tray icon will act as the primary anchor for the application.
2. **Popover Window:** Clicking the tray icon will toggle a frameless, transparent window positioned dynamically relative to the tray icon (`TrayBottomCenter` via `tauri-plugin-positioner`).
3. **Auto-Hide:** When the popover window loses focus (blur event), it will automatically hide itself, mimicking native macOS popover behavior.

## Consequences
- **Positive:** The app is entirely unobtrusive. It feels native and lightweight, similar to utilities like Raycast or standard Apple menu bar items.
- **Negative:** The app cannot be easily brought to the front via `Cmd+Tab`. Quitting the app requires interacting with the tray menu explicitly. Complex routing or multi-window flows are difficult to implement cleanly in a popover model.