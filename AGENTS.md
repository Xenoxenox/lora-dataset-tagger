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

For local browser smoke tests, start `npm run dev` and open `http://localhost:3000/`. A known sample image for upload testing is `dataset/meion/1250849.jpg`. Cover the main flows: image import, image preview, parsed caption fields, manual tag editing and final preview updates, Chinese/English language switching, settings/help dialogs, crop/resize dialog controls, single `.txt` export, batch ZIP export, and AI auto-caption generation when API configuration is available. Current non-blocking console findings include `/favicon.ico` returning 404, the Tailwind CDN development warning, and form accessibility issues for missing labels/id/name attributes.

## Commit & Pull Request Guidelines

The current Git history only shows an initial commit, so no strict commit convention is established. Use short imperative messages such as `Add caption export helper` or `Fix dataset ZIP naming`. Pull requests should include a brief summary, validation steps run, linked issues when available, and screenshots or screen recordings for visible UI changes.

## Agent-Specific Instructions

Keep generated assets and downloaded datasets scoped to `dataset/`. Do not expose API keys in logs, screenshots, commits, or generated documentation. Before broad refactors, check whether a focused update to `services/`, `utils/`, or `i18n.ts` is sufficient.
