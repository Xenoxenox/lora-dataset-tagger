# Domain Docs

This project uses a **single-context** layout. There is one shared domain context for the entire repository.

## Files skills read

| File | Purpose |
|------|---------|
| `CONTEXT.md` | Project domain language, glossary, key concepts, and architecture overview. |
| `docs/adr/` | Architecture Decision Records — past decisions with context and rationale. |

## When to read these

The following skills consume domain docs:

- **improve-codebase-architecture** — reads `CONTEXT.md` and `docs/adr/` to understand existing architectural intent before proposing changes.
- **diagnose** — reads `CONTEXT.md` for domain terminology when investigating issues.
- **tdd** — reads `CONTEXT.md` to understand the domain before writing tests.

## Creating or updating

- `CONTEXT.md`: Write it at the repo root. Keep it concise — domain glossary, key abstractions, and architectural principles.
- ADRs: Create one file per decision under `docs/adr/`. Use the filename convention `NNNN-slug.md` (e.g., `0001-use-gemini-vision-api.md`).
