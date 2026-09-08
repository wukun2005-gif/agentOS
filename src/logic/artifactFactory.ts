import type { Artifact, IntentKind } from '../components/orb/OrbState'
import * as BriefAgent from '../agents/BriefAgent'
import * as DocumentAgent from '../agents/DocumentAgent'
import * as EmailAgent from '../agents/EmailAgent'
import * as MeetingAgent from '../agents/MeetingAgent'
import * as MessageAgent from '../agents/MessageAgent'
import * as ReportAgent from '../agents/ReportAgent'
import * as FocusAgent from '../agents/FocusAgent'
import type { RouteResult } from './intentRouter'

/**
 * ArtifactFactory — 意图 → 任务产物（PRD v1.0 §4.1 逻辑层）
 *
 * 每次意图最多产出 3 张卡片，对应三层空间槽位 focus / near / far。
 */

let seq = 0
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${seq++}`

export function buildArtifacts(route: RouteResult): Artifact[] {
  const { kind, rawText, replyMode } = route

  switch (kind) {
    case 'brief': {
      const minutes = MeetingAgent.getMinutes()
      return [
        {
          id: nextId('brief'),
          kind: 'brief',
          priority: 'primary',
          zone: 'focus',
          status: 'active',
          actions: ['expand', 'dismiss'],
          data: { type: 'brief', brief: BriefAgent.getMorningBrief() },
        },
        {
          id: nextId('mtg'),
          kind: 'meeting',
          priority: 'secondary',
          zone: 'near',
          status: 'active',
          actions: ['confirm', 'expand', 'dismiss'],
          data: { type: 'meeting', minutes },
        },
      ]
    }

    case 'email': {
      if (replyMode) {
        const email = EmailAgent.pickEmail(rawText)
        return [
          {
            id: nextId('mail'),
            kind: 'email',
            priority: 'primary',
            zone: 'focus',
            status: 'waiting',
            actions: ['confirm', 'edit', 'cancel'],
            data: {
              type: 'email',
              email,
              mode: 'reply',
              draft: EmailAgent.composeReply(email),
            },
          },
        ]
      }
      const inbox = EmailAgent.triageInbox().slice(0, 2)
      return inbox.map((email, i) => ({
        id: nextId('mail'),
        kind: 'email' as IntentKind,
        priority: i === 0 ? ('primary' as const) : ('secondary' as const),
        zone: i === 0 ? ('focus' as const) : ('near' as const),
        status: 'active' as const,
        actions: ['confirm', 'expand', 'dismiss'],
        data: { type: 'email' as const, email, mode: 'triage' as const },
      }))
    }

    case 'meeting': {
      // 会前准备 vs 会后纪要：按关键词区分（PRD §4.2.3 会议全链路）
      const isPrep = /准备|备好|会前|会前准备|开始前|材料|预习|对齐一下|过一遍/.test(rawText)
      if (isPrep) {
        const prep = MeetingAgent.getPrep()
        return [
          {
            id: nextId('prep'),
            kind: 'prep',
            priority: 'primary',
            zone: 'focus',
            status: 'active',
            actions: ['confirm', 'dismiss'],
            data: { type: 'prep', prep },
          },
        ]
      }
      const minutes = MeetingAgent.getMinutes()
      return [
        {
          id: nextId('mtg'),
          kind: 'meeting',
          priority: 'primary',
          zone: 'focus',
          status: 'active',
          actions: ['confirm', 'expand', 'dismiss'],
          data: { type: 'meeting', minutes },
        },
      ]
    }

    case 'message':
      return [
        {
          id: nextId('msg'),
          kind: 'message',
          priority: 'primary',
          zone: 'focus',
          status: 'active',
          actions: ['confirm', 'dismiss'],
          data: { type: 'message', digest: MessageAgent.getDigest() },
        },
      ]

    case 'doc':
      return [
        {
          id: nextId('doc'),
          kind: 'doc',
          priority: 'primary',
          zone: 'focus',
          status: 'active',
          actions: ['expand', 'dismiss'],
          data: { type: 'doc', query: rawText, results: DocumentAgent.searchDocuments(rawText) },
        },
      ]

    case 'settings': {
      // 提到"通知/免打扰/静音"→ 全局免打扰；否则打开设置面板
      const dnd = /通知|免打扰|静音|勿扰/.test(rawText)
      if (dnd) {
        return [
          {
            id: nextId('setting'),
            kind: 'setting',
            priority: 'primary',
            zone: 'focus',
            status: 'active',
            actions: ['dismiss'],
            data: { type: 'setting', result: { setting: 'dnd', label: '已开启全局免打扰', applied: false } },
          },
        ]
      }
      return [
        {
          id: nextId('setting'),
          kind: 'setting',
          priority: 'primary',
          zone: 'focus',
          status: 'active',
          actions: ['dismiss'],
          data: { type: 'setting', result: { setting: 'open', label: '打开系统设置', applied: false } },
        },
      ]
    }

    case 'report': {
      const report = ReportAgent.getWeeklyReport()
      return [
        {
          id: nextId('report'),
          kind: 'report',
          priority: 'primary',
          zone: 'focus',
          status: 'waiting',
          actions: ['confirm', 'edit', 'dismiss'],
          data: { type: 'report', report },
        },
      ]
    }

    case 'focus': {
      const duration = /(\d+)\s*分钟/.test(rawText)
        ? (rawText.match(/(\d+)\s*分钟/)?.[0] ?? '90 分钟')
        : '90 分钟'
      const session = FocusAgent.getFocusPlan(duration)
      return [
        {
          id: nextId('focus'),
          kind: 'focus',
          priority: 'primary',
          zone: 'focus',
          status: 'active',
          actions: ['cancel', 'dismiss'],
          data: { type: 'focus', session },
        },
      ]
    }

    default:
      return [
        {
          id: nextId('legacy'),
          kind,
          priority: 'primary',
          zone: 'focus',
          status: 'active',
          actions: ['confirm', 'cancel'],
        },
      ]
  }
}

/** 意图不明时的澄清卡片 */
export function buildClarificationArtifact(message: string): Artifact {
  return {
    id: nextId('clarify'),
    kind: 'clarification',
    priority: 'primary',
    zone: 'focus',
    status: 'waiting',
    actions: ['dismiss'],
    title: '需要澄清',
    message,
  }
}
