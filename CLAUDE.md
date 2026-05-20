# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述 / Project Overview

LoRA Dataset Tagger Pro - 基于 Google Gemini Vision API 的 LoRA 训练数据集自动标注工具。项目设计运行于 Google AI Studio，本地目录用于深度调试。

## 开发命令 / Development Commands

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 (Vite, 端口 3000)
npm run build        # 生产构建
npm run preview      # 预览生产构建
```

## 环境配置 / Environment Setup

在 `.env.local` 中配置 `GEMINI_API_KEY`：
```
GEMINI_API_KEY=<your-google-gemini-api-key>
```

通过 `.venv\Scripts\Activate.ps1`配置和管理python虚拟环境，使用python库前先pip list

## 技术栈 / Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** (CDN 引入)
- **@google/genai** - Gemini API 客户端 (使用 gemini-3-flash-preview 模型)
- **jszip** - 批量导出 ZIP 压缩

## 架构说明 / Architecture

### 单文件应用结构
主要逻辑集中在 `App.tsx`，采用 React Hooks 进行状态管理：

```
App.tsx (主组件, ~670行)
├── 状态层: useState (images, currentIndex, frozenFields, cropBox 等)
├── UI层: 三栏布局 (Library | Viewer | TagEditor)
└── 功能层: 导入、自动标注、裁剪、导出
```

当前布局补充：
- 根容器在小屏下允许 `overflow-y-auto`，桌面 `lg` 维持单屏工作台。
- `Final Formatted Output` 提供全屏审阅弹窗和复制操作。
- `Resize` 弹窗在预览图角落展示原始分辨率 Badge，并保留 GPU 推荐提示与动作按钮。

### 核心服务
- `services/geminiService.ts` - Gemini Vision API 封装，返回结构化 TagData
- `utils/fileUtils.ts` - Base64 转换、文件下载工具

### 数据流
```
导入图片 → TaggedImage[] → 选择查看 → 手动编辑/AI标注 → 导出 .txt/.zip
```

### TagData 结构 (11个分类字段)
character, style, clothing, expression, action, position, background, lighting, atmosphere, objects, other

## 核心功能 / Key Features

1. **图片导入** - 多文件上传、拖放支持
2. **AI 自动标注** - Gemini Vision 生成 Danbooru 风格标签
3. **字段冻结** - 跨图片锁定特定标签值
4. **图片裁剪** - Canvas 实现的宽高比裁剪
5. **批量导出** - 单文件 `.txt` 或 ZIP 打包
6. **最终输出审阅** - 全屏弹窗复制/关闭
7. **Resize 辅助** - 原图尺寸 Badge 与紧凑推荐信息
8. **国际化** - 中英双语 (浏览器自动检测)

## 开发注意事项 / Development Notes

- 项目通过 Vite 的 `define` 注入环境变量 (`process.env.GEMINI_API_KEY`)
- Tailwind 通过 CDN 加载，无需本地编译
- 图片以 Base64 形式传递给 Gemini API
- 导出文件名与源图片名匹配 (image.png → image.txt)

## 训练集的存放
训练集存放在 `.\dataset`目录

claude mcp add context7 -- npx -y @upstash/context7-mcp --api-key ctx7sk-072c8bf2-53d2-41a6-aad1-60a8acf2eff6

## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five canonical triage labels with default names: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
