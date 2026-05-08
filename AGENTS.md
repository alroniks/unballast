# AGENTS.md — Unballast App

> Quick links: [Architecture](docs/ARCHITECTURE.md) · [Implementation Plan](docs/PLAN.md)

**Important Rule:** The application name is strictly **Unballast**. Never refer to it as "Nodemode" or any other legacy codename.

---

## 1. Task Workflow

### 1a. Implementation Strategy
- **Architecture First:** The application is split into three boundaries: Rust Core Library, Rust CLI, and Tauri Shell.
- **Core Library Rule:** Code placed in `src-tauri/src/core/` MUST NOT import or rely on any Tauri-specific APIs (`tauri::`). It must remain pure Rust to allow the CLI binary to consume it without the GUI overhead.
- **Performance:** File system traversal is slow. Always use multi-threaded libraries like `jwalk`. Do not use standard `std::fs::read_dir` for recursive deep scans.
- **Safety:** Never use `std::fs::remove_dir_all` (or equivalent `rm -rf`) for user directories. Always use the `trash` crate to move folders to the macOS Bin.

### 1b. Commits & Pushes
- Work on `main` branch — no branches, no PRs. Pre-push blocks work from any other branch.
- Commit every logical unit: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`.
- **⛔ NEVER use --no-verify** to skip the Git hooks.
- A task is NOT done until `git push origin main` succeeds. If the hook blocks, fix the lint/test failure, commit the fix, and push again.

### 1c. TDD (Mandatory)
Red → Green → Refactor → Commit.
- **Rust Backend:** Write unit tests (`#[test]`) alongside the implementation in the Core library. Tests must pass before linking to the UI.
- **Frontend E2E:** User flows (scanning, clicking "Clean") will be verified via Playwright.

---

## 2. Check Suite (runs on every push)

```bash
pnpm lint && pnpm tsc --noEmit && pnpm test
cargo clippy --manifest-path=src-tauri/Cargo.toml -- -D warnings
cargo fmt --manifest-path=src-tauri/Cargo.toml -- --check
cargo test --manifest-path=src-tauri/Cargo.toml
```

*(Note: Coverage gates like `cargo llvm-cov` will be added once the initial Core is established).*

---

## 3. UI Guidelines

**Always use shadcn/ui or Tremor components.** Never use raw HTML form elements (`<input>`, `<select>`, `<button>`) for user-facing UI. 
- The UI must look native to macOS. Design in dark/graphite mode primarily.
- Keep the popover UI extremely minimal: List of offenders, sizes, and a single action button per row.

---

## 4. Architecture Decision Records (ADRs)

When making a significant architectural, structural, or dependency decision, you must document it via an ADR.
1. Read `docs/adr/TEMPLATE.md` to understand the required format.
2. Identify the next available sequential number (e.g., `0002`) by checking existing files in `docs/adr/`.
3. Create a new file like `docs/adr/0002-short-kebab-case-title.md` and fill it out completely.
4. Append a row to the table in `docs/adr/README.md`.
