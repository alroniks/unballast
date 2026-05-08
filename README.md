![Latest stable](https://img.shields.io/github/v/release/alroniks/unballast?display_name=tag) [![CI](https://github.com/alroniks/unballast/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/alroniks/unballast/actions/workflows/ci.yml)

# ⚓ Unballast

Unballast is a lightweight desktop utility exclusively for **macOS** designed to find and remove heavy dependency directories (like `node_modules`) to free up disk space.

Developers accumulate massive, forgotten dependencies across their projects, unnecessarily consuming disk space. Unballast silently monitors for bloated dependencies and allows for quick, manual, or automated cleanup right from your Menu Bar.

## Principles

- ⚡ **Performance First** — File system traversal is notoriously slow. Unballast relies on multi-threaded Rust to offload I/O operations and scan your folders instantly.
- 🛡️ **Safety Default** — We do not perform irreversible deletions (`rm -rf`) by default. Unballast safely moves folders to the native macOS Bin.
- 👻 **Unobtrusive** — Operates quietly in the background as a Menu Bar accessory. It does not pollute your Dock or the `Cmd+Tab` switcher.
- 💻 **CLI or GUI** — Unballast provides both a gamified, minimalist popover interface and a lightweight terminal interface for power users.
- 🔬 **Open source** — Unballast is free and open source. No tracking, no cloud dependencies.

## Installation

### Homebrew (Coming Soon)

Install via Homebrew on macOS:

```bash
brew install --cask unballast
```

### Download from releases

Download the [latest release here](https://github.com/alroniks/unballast/releases) for macOS (Apple Silicon & Intel).

## Open source and local setup

Unballast is open source and built with Tauri v2, React, TypeScript, and Rust. If you want to run or contribute to the app locally, here is how to get started:

### Prerequisites

- Node.js 20+
- pnpm 9+
- Rust stable
- macOS 11.0+ for development

### Quick start

Clone the repository and install dependencies:

```bash
pnpm install
```

Run the development web server (mocked UI):
```bash
pnpm dev
```

Run the native macOS desktop app with hot-module replacement:
```bash
pnpm tauri dev
```

Run the check suite before pushing:
```bash
pnpm lint && pnpm tsc --noEmit && pnpm test
cargo clippy --manifest-path=src-tauri/Cargo.toml -- -D warnings
cargo test --manifest-path=src-tauri/Cargo.toml
```

## Tech Docs

- 📐 [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System design, tech stack, data flow
- 🗺️ [VISION.md](docs/VISION.md) — Product vision and future roadmap
- 🚀 [PLAN.md](docs/PLAN.md) — Implementation epics and tasks
- 📚 [ADRs](docs/adr/README.md) — Architecture Decision Records

## License

Unballast is open source software.
