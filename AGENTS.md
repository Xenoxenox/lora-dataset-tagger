# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vite React TypeScript app for LoRA dataset tagging. The main UI lives in `App.tsx`, with startup wiring in `index.tsx` and browser markup in `index.html`. Shared types are in `types.ts`, localization strings are in `i18n.ts`, API integrations are in `services/`, and file helpers are in `utils/`. Dataset images, generated captions, and temporary outputs are stored under `dataset/`; avoid committing bulky generated data unless it is intentionally part of a fixture. Python scraping helpers live at the repository root, including `scrape_yande.re.py` and `yande.re_scrape_demo.py`.

## Build, Test, and Development Commands

- `npm install`: install Node dependencies from `package-lock.json`.
- `npm run dev`: start the local Vite development server.
- `npm run build`: create a production build and run TypeScript/Vite checks.
- `npm run preview`: serve the production build locally for validation.

Set `GEMINI_API_KEY` in `.env.local` before running AI-backed features. Keep `.env` and `.env.local` out of commits.

## Coding Style & Naming Conventions

Use TypeScript and React functional components. Follow the existing style: two-space indentation, semicolons, `const` by default, PascalCase for components and exported types, camelCase for functions and variables, and descriptive service names such as `geminiService.ts`. Keep UI state close to `App.tsx` unless a helper belongs naturally in `services/` or `utils/`.

## Testing Guidelines

There is currently no configured test runner or `npm test` script. For now, validate changes with `npm run build` and manual checks in the Vite dev server. If adding tests, prefer colocated `*.test.ts` or `*.test.tsx` files and add the corresponding npm script in `package.json`.

For local browser smoke tests, start `npm run dev` and open `http://localhost:3000/`. A known sample image for upload testing is `dataset/meion/1250849.jpg`. Cover the main flows: image import, image preview, parsed caption fields, manual tag editing and final preview updates, Chinese/English language switching, settings/help dialogs, crop/resize dialog controls, single `.txt` export, batch ZIP export, and AI auto-caption generation when API configuration is available. Current non-blocking console findings include the Tailwind CDN development warning, and form accessibility issues for missing labels/id/name attributes.

## Commit & Pull Request Guidelines

### Commit messages

采用 Conventional Commits 格式：`<type>: <description>`

| Type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `chore` | 构建、依赖、工具链 |
| `docs` | 仅文档 |
| `refactor` | 重构（无功能变化） |
| `style` | 格式化、代码风格 |

说明用英文短祈使句，小写开头，不加句号。示例：
- `feat: add batch ZIP export progress bar`
- `fix: prevent image preview flash on crop`
- `chore: upgrade vite to 6.2`

### Branch naming

语义分支命名：`<type>/<slug>`

- `feat/<slug>` — 新特性
- `fix/<slug>` — Bug 修复
- `chore/<slug>` — 杂项/工具链
- `docs/<slug>` — 文档更新

示例：`feat/setup-agent-skills`、`fix/zip-export-encoding`

### Pull requests

包含简要说明、验证步骤、相关 issue 链接，UI 变更附带截图或录屏。合并到 `main` 前确保工作区干净。

## Agent-Specific Instructions

Keep generated assets and downloaded datasets scoped to `dataset/`. Do not expose API keys in logs, screenshots, commits, or generated documentation. Before broad refactors, check whether a focused update to `services/`, `utils/`, or `i18n.ts` is sufficient.
