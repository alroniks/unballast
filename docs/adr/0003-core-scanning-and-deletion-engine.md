# ADR 0003: Core Scanning and Deletion Engine

## Status
Accepted

## Context
Unballast's primary value proposition is rapidly finding and removing heavy dependency directories (like `node_modules`). Standard file system traversal (`std::fs::read_dir`) or single-threaded walkers are notoriously slow, especially on deep dependency trees. Furthermore, performing recursive deletion (`rm -rf`) programmatically carries a high risk of catastrophic data loss if a path is incorrectly resolved.

## Decision
1. **Multi-threaded Traversal:** We will use the `jwalk` crate for all directory scanning and size calculations. `jwalk` yields entries in parallel. Crucially, we utilize its `process_read_dir` hook to explicitly short-circuit the traversal the moment we hit a target directory (e.g., `node_modules`) or an excluded directory (e.g., `.git`). We do not need to scan *inside* a `node_modules` folder to find more `node_modules` folders.
2. **Safety Default:** We will use the `trash` crate to handle folder removal by default. This delegates the deletion to the native macOS Bin, allowing the user to recover the folder if they made a mistake.
3. **Opt-in Permanent Deletion:** Standard recursive deletion (`std::fs::remove_dir_all`) will be implemented but strictly guarded behind an explicit user setting. It will never be the default behavior.

## Consequences
- **Positive:** Scanning the entire home directory takes seconds rather than minutes. Users are protected from accidental data loss.
- **Negative:** Calculating the size of the found directories requires a secondary pass (also utilizing `jwalk`), which adds slight overhead compared to tracking size during the initial discovery pass. The `trash` crate adds a slight delay to the deletion process as the OS moves the files.