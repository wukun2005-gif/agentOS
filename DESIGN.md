# Aura OS — 架构设计文档

## 概述

Aura OS（Demo 品牌名 Nexus OS）是一个"无 App 时代"的 AI 存在范式 Demo。核心交互实体是一个能量光球（Energy Orb），通过 8 态状态机（idle→listening→captured→understanding→executing→responding→clarifying→error）表达 AI 的存在感和理解过程，信息以 GenUI 卡片形式从光球中"涌现"。

**PRD v1.0 起，场景从生活助手转向打工人办公生产力**：邮件、会议、IM、文档四大信息源，价值主张是"消除意图→操作的翻译成本"，并以"今日节省时长"量化。

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
  └── React 组件树: Orb / CardLayer(3 槽位) / Dock / SystemTray / Panels / Controls

状态层（State）
  └── Zustand store: orbState + artifacts + notifications + timeSaved + scenario

逻辑层（Logic）
  └── IntentRouter（关键词 + 风险分级）/ ArtifactFactory / IntentFlow / SpatialLayout(槽位)

Agent 层（PRD v1.0 新增）
  └── BriefAgent / EmailAgent / MeetingAgent / MessageAgent / DocumentAgent

数据层（Mock）
  └── emails / meetings / messages / documents

输入层（Input）
  └── TextInput（P0）→ SpeechRecognition（P1）
```

### 关键契约

- **风险分级**：`informational`（只读聚合，直接展示）→ `reversible`（可撤销）→ `external-action`（发邮件 / 同步 Jira，必须二次确认）
- **空间槽位**：产物带 `slot: 0|1|2`，轮转分配；新产物只顶替同槽位旧产物，其余卡片不跳位
- **价值量化**：`SAVED_MINUTES` 定义各场景模拟节省时长，完成时累加到 `timeSaved`，顶栏常驻展示

### 渐进增强策略

- **P0（MVP）**: 纯 CSS 动画 + 文字输入 + 预设响应，零外部依赖
- **P1（增强）**: Web Speech API + Canvas 粒子 + ECharts
- **P2（未来）**: Vercel AI SDK + LLM 真实对话

## 模块结构

```
src/
├── agents/              # Agent 逻辑层（PRD v1.0 §5.3）
│   └── types.ts         # 领域模型 + 产物数据契约 + 节省时长口径
├── mock/                # mock 数据：emails / meetings / messages / documents
├── logic/               # intentRouter / artifactFactory / intentFlow
├── components/
│   ├── orb/             # 能量光球 + 状态机定义
│   │   ├── Orb.tsx      # 光球主组件
│   │   ├── Orb.css      # 8 态动画 keyframes
│   │   └── OrbState.ts  # 状态类型 + 意图类型 + 产物契约
│   ├── cards/           # 产物卡片：Email / Meeting / Message / Doc / Brief / Legacy
│   ├── panels/          # 晨间简报条
│   ├── dock/            # Dock 意图入口
│   ├── system-tray/     # 系统托盘 + 通知中心
│   └── controls/        # 命令栏 + 状态切换调试
├── store/               # Zustand store
├── App.tsx              # 根组件
├── App.css              # 全局样式
└── main.tsx             # 入口
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
| 2026-08-13 | Sprint 2: 8 态状态机扩展 + Nexus OS "Liquid Light" 设计迁移 | 全量样式 + Orb + Intent Cards | 7d9e044 |
| 2026-09-08 | PRD v1.0 对齐：办公场景 P0（晨间简报 / 邮件助手 / 会议纪要 / Dock / 系统托盘）+ Agent 层 + mock 数据 + 产物槽位 + 价值量化 | agents/, mock/, logic/, cards/, dock/, system-tray/, panels/, store, App | TBD |
