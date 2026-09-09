import type { Artifact, IntentKind } from '../components/orb/OrbState'
import * as BriefAgent from '../agents/BriefAgent'
import * as DocumentAgent from '../agents/DocumentAgent'
import * as EmailAgent from '../agents/EmailAgent'
import * as MeetingAgent from '../agents/MeetingAgent'
import * as MessageAgent from '../agents/MessageAgent'
import * as ReportAgent from '../agents/ReportAgent'
import * as FocusAgent from '../agents/FocusAgent'
import type { ListResult } from '../agents/types'
import { BriefLists, EmailLists, MeetingLists, MessageLists, DocLists, ReportLists } from '../mock/lists'
import type { RouteResult } from './intentRouter'

/**
 * ArtifactFactory — 意图 → 任务产物（PRD v1.0 §4.1 逻辑层）
 *
 * 每次意图最多产出 3 张卡片，对应三层空间槽位 focus / near / far。
 *
 * 关键修复：每个意图下按 rawText 的**具体子诉求**先做分流——
 * 命中清单类诉求则返回货真价实的 ListResult（拍板事项 / 超时邮件 / 会议价值
 * 评估 / 群结论等），否则返回该场景的默认产物。避免"文案承诺 A、产物给通用
 * B"的货不对板（用户原话痛点："今天 8 个会，哪些可以不去" 曾返回会议纪要）。
 */

let seq = 0
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${seq++}`

/** 通用清单产物 → Artifact（有 confirmLabel 的进入外部动作待确认态） */
function listArtifact(result: ListResult): Artifact {
  const needsConfirm = !!result.confirmLabel
  return {
    id: nextId('list'),
    kind: 'list',
    priority: 'primary',
    zone: 'focus',
    status: needsConfirm ? 'waiting' : 'active',
    actions: needsConfirm ? ['confirm', 'dismiss'] : ['dismiss'],
    data: { type: 'list', result },
  }
}

export function buildArtifacts(route: RouteResult): Artifact[] {
  const { kind, rawText, replyMode } = route
  const t = rawText.toLowerCase()

  switch (kind) {
    case 'brief': {
      // 子诉求分流：具体问法 → 具体清单
      if (/可以不去|不去|哪些会|没必要/.test(t)) return [listArtifact(BriefLists.meetingValue())]
      if (/拍板|决策|定夺/.test(t)) return [listArtifact(BriefLists.decisions())]
      if (/安排|日程/.test(t)) return [listArtifact(BriefLists.schedule())]
      if (/昨晚|隔夜|紧急/.test(t)) return [listArtifact(BriefLists.overnightUrgent())]
      // 默认：通用晨间简报 + 今日会议纪要
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
      // 子诉求分流
      if (/拖了\s*\d+\s*天|超时|几天没回|还没回/.test(t)) return [listArtifact(EmailLists.overdue())]
      if (/按紧急|紧急程度|排序/.test(t)) return [listArtifact(EmailLists.byUrgency())]
      if (/归档|批量/.test(t)) return [listArtifact(EmailLists.archive())]
      if (/婉拒|拒掉|拒绝/.test(t)) return [listArtifact(EmailLists.declineDraft())]
      // 默认：收件箱分类（前 2 封）
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
      const isPrep = /准备|备好|会前|会前准备|开始前|材料|预习|对齐一下|过一遍/.test(t)
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
      // 子诉求分流
      if (/action|归我|哪些.*我|我的.*项/.test(t)) return [listArtifact(MeetingLists.myActions())]
      if (/推掉|取消|不去|邮件就能|可替代|替代/.test(t)) return [listArtifact(MeetingLists.declineMeeting())]
      if (/同步|没参会|没参加|未参会|代读/.test(t)) return [listArtifact(MeetingLists.syncMinutes())]
      // 默认：会后纪要
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
      // 子诉求分流
      if (/提到我|@我|@ 我|mention/.test(t)) return [listArtifact(MessageLists.mentions())]
      if (/等我答复|等我回复|等我就绪|卡在我|在等我/.test(t)) return [listArtifact(MessageLists.awaiting())]
      if (/结论|要点|整理成|总结一下/.test(t)) return [listArtifact(MessageLists.takeaways())]
      if (/跟进|待我|要我/.test(t)) return [listArtifact(MessageLists.followups())]
      // 默认：沟通摘要
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
      // 子诉求分流
      if (/最新版本|别给.*旧版|最新版/.test(t)) return [listArtifact(DocLists.latestVersion())]
      if (/提炼.*要点|要点|提炼|核心/.test(t)) return [listArtifact(DocLists.highlights())]
      if (/改过|变更|历史|谁.*改/.test(t)) return [listArtifact(DocLists.changeHistory())]
      // 默认：文档检索
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
      const dnd = /通知|免打扰|静音|勿扰/.test(t)
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
      // 子诉求分流
      if (/卡住|阻塞|拦住/.test(t)) return [listArtifact(ReportLists.blockers())]
      if (/今天做了|明天|今日复盘|复盘/.test(t)) return [listArtifact(ReportLists.todayReview())]
      // 默认：智能周报
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
      const duration = /(\d+)\s*分钟/.test(t)
        ? (t.match(/(\d+)\s*分钟/)?.[0] ?? '90 分钟')
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
