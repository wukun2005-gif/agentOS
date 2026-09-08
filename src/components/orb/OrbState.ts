import type { ArtifactData } from '../../agents/types'

/**
 * AI 光球状态机 — 8 态（PRD v0.2）
 *
 * Idle          — 待命，青绿色缓慢呼吸
 * Listening     — 接收中，快速脉动
 * Captured      — 已收到，外环向内收拢（350ms → 0.82 倍）
 * Understanding — 理解意图，暖紫脉冲 + 内聚
 * Executing     — 编排/执行，内核轻微旋转（8s 一圈）
 * Responding    — 输出，暖金色轻摆
 * Clarifying    — 澄清，光核温和紫色、停止旋转
 * Error         — 错误，红色短脉冲 2 次后静止 + 断环
 */
export type OrbState =
  | 'idle'
  | 'listening'
  | 'captured'
  | 'understanding'
  | 'executing'
  | 'responding'
  | 'clarifying'
  | 'error'

/** 状态中文标签 */
export const ORB_STATE_LABELS: Record<OrbState, string> = {
  idle: '待命',
  listening: '聆听中',
  captured: '已收到',
  understanding: '理解中',
  executing: '执行中',
  responding: '回应中',
  clarifying: '澄清中',
  error: '错误',
}

/** 状态英文标签（用于状态日志） */
export const ORB_STATE_KEYS: Record<OrbState, string> = {
  idle: 'idle',
  listening: 'listening',
  captured: 'captured',
  understanding: 'understanding',
  executing: 'executing',
  responding: 'responding',
  clarifying: 'clarifying',
  error: 'error',
}

/* ===== PRD v0.2 §10 结构化数据契约 + PRD v1.0 §4 办公场景 ===== */

/**
 * 意图类型 — IntentRouter 输出
 *
 * PRD v1.0 办公场景（P0）：brief 晨间简报 / email 邮件助手 / meeting 会议纪要
 * PRD v1.0 办公场景（P1）：message 沟通摘要 / doc 文档检索 / focus 深度工作保护
 * PRD v1.0 办公场景（P2）：report 智能周报
 * 生活场景（v0.2 保留）：weather / music / timer / reminder / note / search / route
 */
export type IntentKind =
  | 'brief'
  | 'email'
  | 'meeting'
  | 'message'
  | 'doc'
  | 'focus'
  | 'report'
  | 'settings'
  | 'weather'
  | 'music'
  | 'timer'
  | 'reminder'
  | 'note'
  | 'search'
  | 'route'

/** 意图的中文场景名 — 用于意图引言与状态日志 */
export const INTENT_LABELS: Record<IntentKind, string> = {
  brief: '晨间简报',
  email: '邮件助手',
  meeting: '会议纪要',
  message: '沟通摘要',
  doc: '文档检索',
  focus: '深度工作',
  report: '智能周报',
  settings: '系统设置',
  weather: '天气',
  music: '音乐',
  timer: '计时',
  reminder: '提醒',
  note: '笔记',
  search: '搜索',
  route: '路线',
}

/** 风险分级 — 决定是否需要执行确认 */
export type IntentRisk = 'informational' | 'reversible' | 'external-action'

export interface Intent {
  kind: IntentKind
  entities: Record<string, string | number | boolean>
  confidence: number
  risk: IntentRisk
  rawText: string
}

/** 任务产物 — ArtifactFactory 输出 */
export type ArtifactZone = 'focus' | 'near' | 'far'
export type ArtifactStatus = 'active' | 'complete' | 'waiting' | 'pinned'
export type ArtifactKind = IntentKind | 'confirmation' | 'clarification' | 'error' | 'prep' | 'setting'
export type ArtifactAction = 'confirm' | 'cancel' | 'edit' | 'expand' | 'pin' | 'dismiss'

export interface Artifact {
  id: string
  kind: ArtifactKind
  priority: 'primary' | 'secondary' | 'ambient'
  zone: ArtifactZone
  status: ArtifactStatus
  expiresAt?: number
  actions: ArtifactAction[]
  /** 场景数据 — 由 Agent 层产出，驱动卡片渲染（PRD v1.0 §4） */
  data?: ArtifactData
  /** 卡片标题覆盖（默认按 kind 推导） */
  title?: string
  /** 补充文案（澄清/错误态复用） */
  message?: string
  /** 空间槽位 0/1/2 — 停靠后不随新任务跳位，仅被同槽位新产物顶替 */
  slot?: number
  /** 用户拖拽后的像素偏移（窗口管理，PRD §5.1 P1） */
  pos?: { x: number; y: number }
  /** 用户缩放后的卡片宽度（px） */
  w?: number
}

/** 状态转换事件（显式事件驱动，非自动超时） */
export type StateEvent =
  | 'START_INPUT'
  | 'FINAL_TRANSCRIPT'
  | 'PARSED'
  | 'CONFIRM'
  | 'CLARIFY'
  | 'FAIL'
  | 'CANCEL'
  | 'TIMEOUT'
