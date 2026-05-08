# ADR 0002: Localization (i18n) Strategy

## Status
Accepted

## Context
Unballast needs to support multiple languages (English, Belarusian, Russian, Ukrainian, Polish, German). The industry standard for React applications is typically `react-i18next` combined with a translation management system like Crowdin or POEditor. 

However, Unballast is a lightweight desktop utility. Pulling in heavy i18n libraries adds unnecessary bundle size and runtime complexity. Furthermore, managing translations manually across 5+ languages for a solo developer is a massive time sink.

## Decision
1. **Custom i18n Engine:** We will forego 3rd-party i18n runtime libraries. Instead, we have implemented a custom, zero-dependency, fully-typed TypeScript localization engine (`src/i18n/index.ts`). It handles basic string interpolation, fallback to English, and browser/system locale detection.
2. **AI-Driven Translation:** We will use **Lara CLI** (`@translated/lara-cli`) as our translation pipeline. Developers will only write and maintain the source `en.json` file. Lara will automatically generate and update all target locales using LLMs via the `pnpm l10n:translate` command.

## Consequences

**Positive:**
- **Zero bundle bloat:** The i18n engine is just a few dozen lines of pure TypeScript.
- **Type Safety:** We can strictly type our translation keys so the compiler catches missing strings.
- **Zero Maintenance:** Adding new features doesn't require waiting on human translators or managing external platform syncs.

**Negative / Risks:**
- **Limited features out-of-the-box:** Our custom engine does not currently support complex pluralization or ICU message formatting. If the app grows highly complex, we will have to build those features ourselves.
- **AI Translation Quality:** We rely on an LLM to understand the context of words like "Clean" or "Scan" based on the `lara.yaml` instructions. We may need to tweak prompts if translations drift.