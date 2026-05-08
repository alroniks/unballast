# ADR 0001: Tech Stack and Repository Structure

## Status
Accepted

## Context
We need a robust, maintainable foundation for a macOS System Tray utility app that scans local file systems rapidly and provides a modern UI. We want to align with the proven development structure of reference projects (like Tolaria) to ensure simple long-term maintenance for a single developer.

## Decision
1. **Application Framework:** We will use **Tauri v2**. It offers a tiny memory footprint (unlike Electron) while allowing us to build the UI with web technologies and handle heavy file system operations natively in Rust.
2. **Frontend:** We will use **React with TypeScript**, bundled by **Vite**. React provides a massive ecosystem for UI components (e.g., Lucide, Tremor), and Vite provides instant HMR.
3. **Package Manager:** We will use **pnpm**. It is significantly faster and uses less disk space than npm/yarn. 
4. **Testing:** We will use standard Rust `cargo test` for backend unit logic, and **Playwright** for End-to-End (E2E) testing.
5. **Repository Structure:** We will adopt a workspace-like flat structure:
   - `src/` (React Frontend)
   - `src-tauri/` (Rust Backend)
   - `docs/` (Architecture and Planning)
   - `e2e/` (Playwright tests)

## Consequences
- **Positive:** Rust ensures that recursive file scanning won't block the UI thread and will be highly performant. The binary size will be small (under 10MB).
- **Negative:** Requires context switching between Rust and TypeScript. We must explicitly define IPC (Inter-Process Communication) boundaries. Tauri v2 introduces newer, slightly more complex plugin architectures compared to v1.
