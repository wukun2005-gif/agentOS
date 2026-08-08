# Aura OS — AI 存在范式 Demo

基于三份 AI 生成的 MVP PRD（Aura OS / Intent OS / Energy Orb），结合三份评估报告的对比分析，取长补短合并为一份完整 PRD，并逐步开发为可运行的交互式 Demo。

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:5173/

## 技术栈

- **框架**: React 18 + TypeScript + Vite
- **样式**: 手写 CSS 动画（光球呼吸、状态切换）
- **状态**: Zustand（Sprint 2 引入）
- **静态检查**: ESLint + TypeScript 严格模式
- **部署**: Vercel / GitHub Pages

## 项目结构

```
├── doc/                    # PRD 文档与开发计划
│   ├── merged-prd.html     # 合并后的 PRD 主文件
│   ├── dev-plan.html        # 开发实现计划
│   ├── assets/              # 竞品雷达图配置
│   ├── _shared/             # 字体 + JS 库
│   └── 3995-{1,2,3}.html   # 原始 PRD
├── src/                    # Demo 源代码
│   ├── components/orb/      # F1: 能量光球
│   ├── App.tsx             # 根组件
│   ├── App.css             # 全局样式
│   └── main.tsx             # 入口
├── DESIGN.md              # 架构设计文档
└── package.json
```

## 文档

- **PRD**: [doc/merged-prd.html](doc/merged-prd.html)
- **开发计划**: [doc/dev-plan.html](doc/dev-plan.html)
- **架构设计**: [DESIGN.md](DESIGN.md)

## 开发命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产产物
npm run typecheck   # 类型检查
npm run lint        # 静态代码检查
```
