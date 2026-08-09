# Aura OS — AI 存在范式 Demo

一个"无 App 时代"的 AI 交互范式演示。核心交互实体是一个能量光球（Energy Orb），通过 5 态状态机（Idle → Listening → Understanding → Thinking → Responding）表达 AI 的存在感和理解过程。

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:5173/

## 功能

- **能量光球**：CSS 动画驱动的光球，5 种状态各有独立视觉表现（颜色、缩放、旋转、周期）
- **状态切换**：5 按钮组 + 光球点击 + 键盘快捷键（空格/ESC）
- **意图输入**：文字输入框 + 回车触发完整状态流转 + 3 个快捷按钮
- **无障碍**：支持 `prefers-reduced-motion`

## 项目结构

```
├── src/
│   ├── components/orb/        # 能量光球组件 + 5 态动画
│   ├── components/controls/   # 状态切换控制 + 意图输入
│   ├── store/                 # Zustand 状态管理
│   ├── App.tsx
│   └── main.tsx
├── doc/                       # PRD 与开发计划文档
└── package.json
```

## 开发命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产产物
npm run typecheck   # 类型检查
npm run lint        # 静态代码检查
```
