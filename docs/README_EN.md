# LoRA Dataset Tagger Pro

Local LoRA dataset tagging tool built with Vite, React, TypeScript, and Tailwind CDN.

## What it does

- Import one or more training images.
- Edit Danbooru-style tags and freeze fields across images.
- Auto-tag with Gemini or OpenAI-compatible endpoints.
- Configure custom API credentials and reverse prompt settings in the Settings dialog.
- Export a single `.txt` or a ZIP bundle.
- Resize oversized images with a live preview and original-size badge.
- Review the final caption in a fullscreen modal with copy support.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set `GEMINI_API_KEY` in [.env.local](.env.local) if you want AI tagging
3. Start the dev server: `npm run dev`
4. Open `http://localhost:3000/`

Custom OpenAI-compatible API settings and reverse prompt overrides are stored locally in the browser from the Settings dialog. Do not commit API keys or generated local configuration.

## Smoke Test

Use `dataset/test_only/305895.jpg` for quick browser checks.
Verify image import, manual tag editing, AI auto-caption generation when API configuration is available, settings save/load, reverse prompt restore-default behavior, output review modal, resize badge, ZIP export, and responsive scrolling at both small and large viewport sizes.
