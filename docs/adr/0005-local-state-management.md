# ADR 0005: Local State Management

## Status
Accepted

## Context
Unballast requires a mechanism to persist two main types of data:
1. **Configuration:** The user's preferences, such as the root directory to scan (`root_path`), the names of folders to target (`targets`), and directories to skip (`exclusions`).
2. **Metrics:** The gamified "Lifetime Space Freed" metric.

While we could use a local SQLite database (like Tolaria) or write a custom JSON file manager in Rust, these approaches introduce unnecessary complexity for simple key-value state.

## Decision
We will use the official `tauri-plugin-store` to manage local state. The plugin will maintain a `.json` file (`unballast_settings.json`) in the user's standard application data directory.

The state will be primarily read and updated from the React frontend via the plugin's JavaScript API. 

## Consequences
- **Positive:** Reduces backend boilerplate. The frontend can directly await and mutate state without needing custom IPC commands for every setting. It includes built-in auto-saving and serialization.
- **Negative:** The Rust Core Library currently cannot synchronously access this state without invoking the plugin's Rust API, meaning the configuration must be explicitly passed from the frontend to the backend during operations like `scan_folders`.