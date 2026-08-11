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

/* ===== PRD v0.2 §10 结构化数据契约 ===== */

/** 意图类型 — IntentRouter 输出 */
export type IntentKind = 'weather' | 'music' | 'timer' | 'reminder' | 'note' | 'search' | 'route'

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
export type ArtifactKind = IntentKind | 'confirmation' | 'clarification' | 'error'
export type ArtifactAction = 'confirm' | 'cancel' | 'edit' | 'expand' | 'pin' | 'dismiss'

export interface Artifact {
  id: string
  kind: ArtifactKind
  priority: 'primary' | 'secondary' | 'ambient'
  zone: ArtifactZone
  status: ArtifactStatus
  expiresAt?: number
  actions: ArtifactAction[]
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
