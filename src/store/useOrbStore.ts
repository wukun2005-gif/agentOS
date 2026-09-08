import { create } from 'zustand'
import type { Artifact, IntentKind, OrbState } from '../components/orb/OrbState'

/** 系统托盘通知（PRD v1.0 §5.1 系统托盘） */
export interface Notification {
  id: string
  icon: string
  title: string
  detail?: string
  time: string
  read: boolean
  tone: 'info' | 'success' | 'warn'
  /** 点击通知触发的动作（让 OS 直接采取对应行为） */
  action?: NotificationAction
}

/** 通知点击动作：派发意图 / 切换侧栏视图 / 仅关闭 */
export type NotificationAction =
  | { kind: 'intent'; text: string }
  | { kind: 'view'; view: SideView }
  | { kind: 'dismiss' }

/** 一次意图运行形成一条「会话线程」（侧栏 Threads 视图） */
export interface Thread {
  id: string
  kind: IntentKind | 'unknown'
  query: string
  time: string
  status: 'running' | 'done'
  artifactCount: number
}

export type SideView = 'core' | 'threads' | 'history' | 'settings'

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    icon: 'mail',
    title: 'CEO 邮件需要今晚前确认',
    detail: 'Q3 预算调整 · 市场费用削减 20%',
    time: '08:42',
    read: false,
    tone: 'warn',
    action: { kind: 'intent', text: '帮我回复 CEO 的邮件' },
  },
  {
    id: 'n2',
    icon: 'alternate_email',
    title: '张三在 #project-alpha 提到了你',
    detail: 'API 版本策略要不要跟 v2 一起发？',
    time: '09:12',
    read: false,
    tone: 'info',
    action: { kind: 'intent', text: '#project-alpha 提到我什么' },
  },
  {
    id: 'n3',
    icon: 'groups',
    title: '10:00 产品评审会',
    detail: '3 份材料已备好 · 30 分钟后开始',
    time: '09:30',
    read: false,
    tone: 'info',
    action: { kind: 'intent', text: '准备一下10点的产品评审会' },
  },
]

interface OrbStore {
  orbState: OrbState
  setOrbState: (state: OrbState) => void
  transcript: string
  setTranscript: (text: string) => void
  intentFlowActive: boolean
  setIntentFlowActive: (active: boolean) => void
  /** 错误态的原因（error 态显示） */
  errorMessage: string
  setErrorMessage: (message: string) => void

  /** 当前活跃的任务产物列表（最多 3 张，对应三层空间槽位） */
  artifacts: Artifact[]
  setArtifacts: (artifacts: Artifact[]) => void
  updateArtifact: (id: string, patch: Partial<Artifact>) => void
  dismissArtifact: (id: string) => void
  clearArtifacts: () => void

  /** 当前场景（驱动晨间简报面板与状态日志） */
  scenario: IntentKind | null
  setScenario: (scenario: IntentKind | null) => void
  /** AI 复述文本 — "听+懂协议"里的"懂" */
  acknowledgment: string
  setAcknowledgment: (text: string) => void

  /** 通知中心 */
  notifications: Notification[]
  pushNotification: (n: Omit<Notification, 'id' | 'read' | 'time'> & { time?: string }) => void
  markAllNotificationsRead: () => void

  /** 今日累计节省时长（分钟）— PRD §1.4 效率提升可视化 */
  timeSaved: number
  addTimeSaved: (minutes: number) => void

  /** 深度工作模式（PRD v1.0 §4.2.6）— 进入后屏蔽非 VIP 通知 */
  focusMode: boolean
  setFocusMode: (on: boolean) => void

  /** 全局免打扰（PRD v1.0 §5.1 P2 自然语言设置）— 屏蔽所有通知 */
  dndAll: boolean
  setDndAll: (on: boolean) => void

  /** 侧栏当前视图（Core / Threads / History / Settings） */
  view: SideView
  setView: (view: SideView) => void

  /** 会话线程列表（每次意图运行一条，最新在前） */
  threads: Thread[]
  pushThread: (thread: Thread) => void
  updateThread: (id: string, patch: Partial<Thread>) => void

  /** 重置演示：清空产物 / 线程 / 通知 / 节省时长，回到 Core */
  resetDemo: () => void
}

/** 当前时间的 HH:MM */
function nowHM(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

let notifSeq = 0

export const useOrbStore = create<OrbStore>((set) => ({
  orbState: 'idle',
  setOrbState: (orbState) => set({ orbState }),
  transcript: '',
  setTranscript: (transcript) => set({ transcript }),
  intentFlowActive: false,
  setIntentFlowActive: (intentFlowActive) => set({ intentFlowActive }),
  errorMessage: '',
  setErrorMessage: (errorMessage) => set({ errorMessage }),

  artifacts: [],
  setArtifacts: (artifacts) => set({ artifacts: artifacts.slice(-3) }),
  updateArtifact: (id, patch) =>
    set((s) => ({
      artifacts: s.artifacts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),
  dismissArtifact: (id) => set((s) => ({ artifacts: s.artifacts.filter((a) => a.id !== id) })),
  clearArtifacts: () => set({ artifacts: [] }),

  scenario: null,
  setScenario: (scenario) => set({ scenario }),
  acknowledgment: '',
  setAcknowledgment: (acknowledgment) => set({ acknowledgment }),

  notifications: SEED_NOTIFICATIONS,
  pushNotification: (n) =>
    set((s) => ({
      notifications: [
        { ...n, id: `n-${Date.now()}-${notifSeq++}`, read: false, time: n.time || nowHM() },
        ...s.notifications,
      ].slice(0, 12),
    })),
  markAllNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  timeSaved: 0,
  addTimeSaved: (minutes) => set((s) => ({ timeSaved: s.timeSaved + minutes })),

  focusMode: false,
  setFocusMode: (focusMode) => set({ focusMode }),

  dndAll: false,
  setDndAll: (dndAll) => set({ dndAll }),

  view: 'core',
  setView: (view) => set({ view }),

  threads: [],
  pushThread: (thread) =>
    set((s) => ({ threads: [thread, ...s.threads].slice(0, 30) })),
  updateThread: (id, patch) =>
    set((s) => ({
      threads: s.threads.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  resetDemo: () =>
    set({
      artifacts: [],
      threads: [],
      notifications: SEED_NOTIFICATIONS,
      timeSaved: 0,
      focusMode: false,
      dndAll: false,
      view: 'core',
      scenario: null,
      transcript: '',
      acknowledgment: '',
      errorMessage: '',
      orbState: 'idle',
      intentFlowActive: false,
    }),
}))
