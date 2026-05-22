# LoRA Dataset Tagger Pro

基于 Vite + React + TypeScript + Tailwind CDN 的本地 LoRA 训练集标注工具。

## 功能概览

- 批量导入训练图片。
- 编辑 Danbooru 风格标签，支持跨图片冻结字段。
- 调用 Gemini 或 OpenAI 兼容接口自动生成标注。
- 在设置面板中自定义 API 密钥与反向提示词（Reverse Prompt）。
- 导出单张 `.txt` 标注文件或整个数据集 ZIP 包。
- 对超大图片进行缩放，实时预览并显示原始尺寸角标。
- 全屏弹窗查看最终标注文本，支持一键复制。

## 本地运行

**环境要求：** Node.js

1. 安装依赖：`npm install`
2. 如需 AI 自动标注，在 [.env.local](.env.local) 中配置 `GEMINI_API_KEY`
3. 启动开发服务器：`npm run dev`
4. 浏览器访问 `http://localhost:3000/`

OpenAI 兼容接口的自定义设置以及反向提示词覆盖值会在浏览器本地存储中保存（通过设置面板操作）。注意：不要将 API 密钥或本地生成的配置提交到代码仓库。

## 冒烟测试

用 `dataset/test_only/305895.jpg` 快速验证以下流程：图片导入、手动标签编辑、AI 自动标注（需已配置 API）、设置保存与恢复、反向提示词还原默认值、导出预览弹窗、缩放角标、ZIP 打包导出，以及小屏 / 大屏下的响应式滚动表现。
