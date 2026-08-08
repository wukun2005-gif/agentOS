# Aura OS — 架构设计文档

## 概述

Aura OS 是一个"无 App 时代"的 AI 存在范式 Demo。核心交互实体是一个能量光球（Energy Orb），通过 5 态状态机（Idle→Listening→Understanding→Thinking→Responding）表达 AI 的存在感和理解过程，信息以 GenUI 卡片形式从光球中"涌现"。

## 技术架构

### 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 框架 | React 18 + TypeScript + Vite | 组件化开发 |
| 样式 | 手写 CSS 动画 | 光球呼吸、状态切换 |
| 状态 | Zustand | AI 状态机管理（Sprint 2 引入） |
| 静态检查 | ESLint + tsc | 代码质量保证 |

### 架构分层

```
表现层（Presentation）
  └── React 组件树: Orb / Waveform / CardLayer / SpatialLayout / Controls

状态层（State）
  └── Zustand store: orbState + setOrbState + cardList

逻辑层（Logic）
  └── IntentRouter / CardFactory / LayoutEngine

输入层（Input）
  └── TextInput（P0）→ SpeechRecognition（P1）
```

### 渐进增强策略

- **P0（MVP）**: 纯 CSS 动画 + 文字输入 + 预设响应，零外部依赖
- **P1（增强）**: Web Speech API + Canvas 粒子 + ECharts
- **P2（未来）**: Vercel AI SDK + LLM 真实对话

## 模块结构

```
src/
├── components/
│   ├── orb/              # 能量光球
│   │   ├── Orb.tsx       # 光球主组件
│   │   ├── Orb.css       # 5 态动画 keyframes
│   │   └── OrbState.ts   # 状态类型定义
│   ├── waveform/          # 声波可视化（Sprint 2）
│   ├── cards/             # GenUI 卡片（Sprint 3）
│   ├── spatial/           # 空间化布局（Sprint 3）
│   ├── controls/          # 交互控件
│   └── confirmation/      # 理解确认（Sprint 2）
├── store/                 # Zustand store
├── logic/                 # 意图路由 + 预设数据
├── App.tsx               # 根组件
├── App.css               # 全局样式
└── main.tsx              # 入口
```

## 核心设计

### 光球状态机

```
Idle → Listening → Understanding → Thinking → Responding → Idle
```

| 状态 | 颜色 | 动画 | 语义 |
|------|------|------|------|
| Idle | #00e5cc @60% | 5s 呼吸 scale(1.0→1.08) | 待命 |
| Listening | #00e5cc @100% | 0.8s 快速脉动 | 接收中 |
| Understanding | #00e5cc→#7c5cff | 0.4s 向内收缩 | 理解中 |
| Thinking | #7c5cff @90% | 2s 旋转脉动 | 深度处理 |
| Responding | #ffb84d @90% | 1.5s 左右轻摆 | 输出 |

### 精确视觉参数

| 参数 | 值 |
|------|-----|
| 核心层颜色（Idle） | HSL(180, 80%, 55%) |
| 呼吸缩放幅度 | scale(1.0) → scale(1.08) |
| 呼吸周期 | 5s ease-in-out |
| 光晕环 1 | 4s 周期 |
| 光晕环 2 | 5s 周期（素数关系避免同步） |
| 光球直径 | 160px |
| 光球位置 | top 45%, left 50% |
| 深色背景 | #0a0e1a |

## Change Log

| 日期 | 简述 | 影响范围 | 关联 commit |
|------|------|----------|-------------|
| 2026-08-08 | F1: 项目初始化 + 能量光球渲染（Idle 态） | 全新项目骨架 + Orb 组件 | TBD |

| 2026-08-08 | F2: 五态状态机 — Zustand store + 5 态视觉编码 + 自动超时 | Orb.tsx/CSS, useOrbStore.ts | TBD |
| 2026-08-08 | F4: 状态切换控制 — 按钮组 + 光球点击 + 键盘快捷键 | StateControls.tsx/CSS, App.tsx | TBD |
| 2026-08-08 | F9: 文字输入意图 — 输入框 + 回车触发状态流转 + 快捷按钮 | IntentInput.tsx/CSS, App.tsx | TBD |
