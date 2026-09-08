/**
 * Agent OS — 办公场景领域模型（PRD v1.0 §4）
 *
 * 所有数据均为 mock，用于验证交互范式而非 AI 准确度（PRD §1.4 Non-Goals）。
 * 数值口径来自 PRD §2 调研：邮件 11.7h/周、会议纪要 1.5-2h/次、IM 90min/天。
 */

/* ===== 邮件（PRD §4.2.2 邮件 AI 助手） ===== */

/** 智能分类：VIP / 需要回复 / 可稍后 / 可自动归档 */
export type EmailPriority = 'vip' | 'reply' | 'later' | 'auto'

export interface MockEmail {
  id: string
  from: string
  role: string
  subject: string
  preview: string
  priority: EmailPriority
  time: string
  unread: boolean
  needsReply: boolean
  /** 预生成回复草稿（模拟 LLM 生成） */
  draft?: string
}

export const EMAIL_PRIORITY_LABELS: Record<EmailPriority, string> = {
  vip: 'VIP · 需决策',
  reply: '需要回复',
  later: '可稍后',
  auto: '自动归档',
}

/* ===== 会议（PRD §4.2.3 会议全链路自动化） ===== */

export interface ActionItem {
  id: string
  text: string
  owner: string
  due: string
}

export interface MeetingDoc {
  id: string
  name: string
  kind: string
}

export interface MeetingMinutes {
  id: string
  title: string
  date: string
  time: string
  duration: string
  attendees: string[]
  decisions: string[]
  actionItems: ActionItem[]
  docs: MeetingDoc[]
}

/* ===== 会议会前准备（PRD §4.2.3 会前准备子场景） ===== */

export interface PrepDoc {
  id: string
  name: string
  kind: string
  /** 预计阅读分钟 */
  mins: number
}

export interface PrepAttendee {
  name: string
  /** 该参会人需你提前确认/对齐的事项 */
  prep: string
}

export interface MeetingPrep {
  id: string
  title: string
  time: string
  duration: string
  agenda: string[]
  docsToRead: PrepDoc[]
  attendees: PrepAttendee[]
  /** 上次会议遗留、本次需跟进的议题 */
  openLoops: string[]
  /** 风险预警 */
  risks: string[]
}

/* ===== 工作沟通（PRD §4.2.4） ===== */

export interface MessageHighlight {
  id: string
  from: string
  text: string
  time: string
  mention: boolean
}

export interface MessageDigest {
  id: string
  channel: string
  window: string
  unread: number
  mentions: number
  highlights: MessageHighlight[]
  extractedTasks: string[]
}

/* ===== 文档检索（PRD §4.2.5） ===== */

export interface DocResult {
  id: string
  name: string
  source: string
  snippet: string
  relevance: number
  updated: string
}

/* ===== 晨间简报（PRD §4.2.1） ===== */

export type BriefItemType = 'email' | 'message' | 'meeting' | 'task'

export interface BriefItem {
  id: string
  type: BriefItemType
  icon: string
  label: string
  title: string
  detail: string
  urgent: boolean
}

export interface BriefStat {
  label: string
  value: string
  tone: 'primary' | 'warn' | 'muted'
}

export interface MorningBrief {
  date: string
  greeting: string
  summary: string
  stats: BriefStat[]
  items: BriefItem[]
  savedMinutes: number
}

/* ===== 智能周报（PRD v1.0 §4.2.7） ===== */

export interface WeeklyReport {
  id: string
  range: string
  headline: string
  stats: { label: string; value: string; delta?: string }[]
  done: string[]
  risks: string[]
  nextWeek: string[]
  savedMinutes: number
}

/* ===== 深度工作保护（PRD v1.0 §4.2.6） ===== */

export interface FocusSession {
  id: string
  durationLabel: string
  startedAt: number
  /** 被屏蔽的通知类型 */
  blocked: string[]
  /** 仅放行的紧急类型 */
  allowThrough: string[]
}

/* ===== 自然语言设置（PRD v1.0 §5.1 P2 系统设置控制） ===== */

export interface SettingResult {
  /** dnd = 全局免打扰；open = 打开设置面板 */
  setting: 'dnd' | 'open'
  label: string
  /** 是否已应用（免打扰类会自动应用） */
  applied: boolean
}

/* ===== 产物数据契约 ===== */

export type ArtifactData =
  | {
      type: 'email'
      email: MockEmail
      /** triage = 分类概览；reply = 回复草稿待确认 */
      mode: 'triage' | 'reply'
      draft?: string
      sent?: boolean
    }
  | {
      type: 'meeting'
      minutes: MeetingMinutes
      synced?: boolean
      mailed?: boolean
      documented?: boolean
    }
  | { type: 'message'; digest: MessageDigest; extracted?: boolean }
  | { type: 'doc'; query: string; results: DocResult[] }
  | { type: 'brief'; brief: MorningBrief }
  | { type: 'report'; report: WeeklyReport; sent?: boolean }
  | { type: 'prep'; prep: MeetingPrep; ready?: boolean }
  | { type: 'setting'; result: SettingResult }
  | {
      type: 'focus'
      session: FocusSession
    }

/* ===== 价值量化（PRD §1.4 效率提升可视化） ===== */

/** 各场景的模拟节省时长（分钟） */
export const SAVED_MINUTES = {
  brief: 55,
  emailTriage: 12,
  emailReply: 8,
  meetingMinutes: 90,
  meetingSync: 20,
  messageDigest: 25,
  docSearch: 16,
  focusSession: 38,
  weeklyReport: 105,
} as const

/** 分钟 → 1h 05m */
export function formatSaved(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${String(m).padStart(2, '0')}m`
}
