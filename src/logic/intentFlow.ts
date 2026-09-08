import { useOrbStore } from '../store/useOrbStore'
import type { Artifact, OrbState } from '../components/orb/OrbState'
import { SAVED_MINUTES } from '../agents/types'
import { buildArtifacts, buildClarificationArtifact } from './artifactFactory'
import { clarificationText, routeIntent } from './intentRouter'

/**
 * 意图流转编排（PRD v0.2 8 态状态机 + PRD v1.0 办公场景）
 *
 * 时序（对齐 P0 验收"800ms 内给出我懂了的反馈"）：
 *   0ms    listening      输入中
 *   350ms  captured       已收到
 *   550ms  understanding  我懂了（AI 复述）
 *   1050ms executing      编排执行
 *   1950ms responding     产物涌现（卡片停留，直到用户关闭或发起新意图）
 */

const TIMING: Array<{ state: OrbState; duration: number }> = [
  { state: 'listening', duration: 350 },
  { state: 'captured', duration: 200 },
  { state: 'understanding', duration: 500 },
  { state: 'executing', duration: 900 },
]

/** 各场景生成产物时累计的节省时长 */
const SCENARIO_SAVED: Record<string, number> = {
  brief: SAVED_MINUTES.brief,
  email: SAVED_MINUTES.emailTriage,
  meeting: SAVED_MINUTES.meetingMinutes,
  message: SAVED_MINUTES.messageDigest,
  doc: SAVED_MINUTES.docSearch,
  focus: SAVED_MINUTES.focusSession,
  report: SAVED_MINUTES.weeklyReport,
  prep: 18,
}

/** 各场景的通知文案 */
const SCENARIO_NOTIFICATION: Record<string, { icon: string; title: string; detail: string }> = {
  brief: { icon: 'wb_sunny', title: '晨间简报已生成', detail: '邮件 / 消息 / 会议已按优先级汇总' },
  email: { icon: 'mail', title: '收件箱已分类', detail: 'VIP 与需要回复的邮件已置顶' },
  meeting: { icon: 'description', title: '会议纪要已生成', detail: '3 项决策 · 3 项行动项' },
  message: { icon: 'forum', title: '频道摘要已生成', detail: '#project-alpha 过去 24 小时' },
  doc: { icon: 'search', title: '跨源检索完成', detail: '邮件附件 / 云盘 / 会议记录' },
  prep: { icon: 'event_available', title: '会议准备清单已生成', detail: '议程 / 材料 / 风险已汇总' },
  focus: { icon: 'shield', title: '已进入深度工作', detail: '非 VIP 通知已替你屏蔽' },
  report: { icon: 'summarize', title: '周报已生成', detail: '确认后一键发送给主管与项目组' },
}

let timers: Array<ReturnType<typeof setTimeout>> = []

/**
 * 槽位游标 — 轮转分配 focus/near/far 三层槽位。
 * 新产物占用下一个槽位并顶替该槽位上的旧产物，其余卡片位置保持不变
 * （PRD v0.2 P0 验收：现有近场产物在新任务出现时不跳位）。
 */
let slotCursor = 0

function nowHM(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** 把新产物停靠到槽位（同槽位旧产物被顶替） */
function dockArtifacts(current: Artifact[], incoming: Artifact[]): Artifact[] {
  const next = [...current]
  for (const artifact of incoming) {
    const slot = slotCursor++ % 3
    const occupied = next.findIndex((a) => a.slot === slot)
    if (occupied >= 0) next.splice(occupied, 1)
    next.push({ ...artifact, slot })
  }
  return next
}

function clearTimers() {
  timers.forEach(clearTimeout)
  timers = []
}

export function cancelIntentFlow() {
  clearTimers()
  useOrbStore.getState().setIntentFlowActive(false)
}

/** 执行一条意图 */
export function runIntentFlow(rawText: string) {
  const store = useOrbStore.getState()
  clearTimers()

  const route = routeIntent(rawText)

  store.setIntentFlowActive(true)
  store.setTranscript(rawText)
  store.setScenario(route?.kind ?? null)
  store.setAcknowledgment(route?.ack ?? '')
  store.setOrbState('listening')

  // 记录一条会话线程（侧栏 Threads 视图）
  const threadId = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  store.pushThread({
    id: threadId,
    kind: route?.kind ?? 'unknown',
    query: rawText,
    time: nowHM(),
    status: 'running',
    artifactCount: 0,
  })

  // 未命中 → 澄清态（P0 验收：意图不明可恢复，不陷入无限状态）
  if (!route) {
    const msg = clarificationText(rawText)
    let elapsed = 0
    for (const step of TIMING.slice(0, 3)) {
      elapsed += step.duration
      const next = step.state
      timers.push(
        setTimeout(() => useOrbStore.getState().setOrbState(next), elapsed),
      )
    }
    timers.push(
      setTimeout(() => {
        const s = useOrbStore.getState()
        s.setOrbState('clarifying')
        s.setArtifacts(dockArtifacts(s.artifacts, [buildClarificationArtifact(msg)]))
        s.updateThread(threadId, { status: 'done', artifactCount: 0 })
        s.setIntentFlowActive(false)
      }, elapsed + 200),
    )
    return
  }

  let elapsed = 0

  for (let i = 0; i < TIMING.length; i++) {
    elapsed += TIMING[i].duration
    const isLast = i === TIMING.length - 1
    const nextState: OrbState = isLast ? 'responding' : TIMING[i + 1].state

    timers.push(
      setTimeout(() => {
        const s = useOrbStore.getState()
        s.setOrbState(nextState)

        if (nextState === 'executing') {
          const produced = buildArtifacts(route)
          s.setArtifacts(dockArtifacts(s.artifacts, produced))
          s.updateThread(threadId, { status: 'done', artifactCount: produced.length })
        }

        if (nextState === 'responding') {
          s.setIntentFlowActive(false)
          const saved = SCENARIO_SAVED[route.kind] ?? 0
          if (saved) s.addTimeSaved(saved)
          const note = SCENARIO_NOTIFICATION[route.kind]
          if (note) s.pushNotification({ ...note, tone: 'success' })
          if (route.kind === 'focus') s.setFocusMode(true)
        }
      }, elapsed),
    )
  }
}
