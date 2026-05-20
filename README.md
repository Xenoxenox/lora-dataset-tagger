# LoRA Dataset Tagger Pro

Local LoRA dataset tagging tool built with Vite, React, TypeScript, and Tailwind CDN.

## What it does

- Import one or more training images.
- Edit Danbooru-style tags and freeze fields across images.
- Auto-tag with Gemini or OpenAI-compatible endpoints.
- Export a single `.txt` or a ZIP bundle.
- Resize oversized images with a live preview and original-size badge.
- Review the final caption in a fullscreen modal with copy support.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set `GEMINI_API_KEY` in [.env.local](.env.local) if you want AI tagging
3. Start the dev server: `npm run dev`
4. Open `http://localhost:3000/`

## Smoke Test

Use `dataset/test_only/305895.jpg` for quick browser checks.
Verify the output review modal, resize badge, and responsive scrolling at both small and large viewport sizes.
