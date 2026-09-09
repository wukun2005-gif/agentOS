import type { Intent, IntentKind, IntentRisk } from '../components/orb/OrbState'

/**
 * IntentRouter — 关键词路由（PRD v1.0 §4.1 逻辑层）
 *
 * P0 阶段用关键词匹配替代 LLM 意图识别，同时输出风险分级：
 *   - informational  只读聚合，直接展示
 *   - reversible     可撤销的本地动作
 *   - external-action 会产生外部副作用（发邮件、同步 Jira），必须二次确认
 *
 * 规则顺序即优先级：办公场景（PRD v1.0）优先于生活场景（PRD v0.2 保留）。
 */

interface RouteRule {
  kind: IntentKind
  risk: IntentRisk
  keywords: string[]
}

const RULES: RouteRule[] = [
  {
    kind: 'brief',
    risk: 'informational',
    keywords: [
      '今天有什么重要',
      '有什么重要的',
      '今天有什么安排',
      '今天重要',
      '早上好',
      '晨间简报',
      '今日简报',
      '晨报',
      '早报',
      '今天怎么样',
      '必须我',
      '今天的日程',
      '可以不去',
    ],
  },
  {
    kind: 'meeting',
    risk: 'reversible',
    keywords: ['纪要', '会议', '评审会', '开会', '会议结束', '同步到jira', '会议记录', '准备一下'],
  },
  {
    kind: 'email',
    risk: 'external-action',
    keywords: ['邮件', '邮箱', '收件箱', '回复', '回信', '回一封', '发邮件', 'inbox', 'mail', 'email'],
  },
  {
    kind: 'message',
    risk: 'informational',
    keywords: ['聊了什么', '消息', '频道', '群里', '沟通', '提到了我', '提到我', '@', '飞书', 'slack', '团队'],
  },
  {
    kind: 'doc',
    risk: 'informational',
    keywords: ['找一下', '找找', '搜一下', '搜索', '文档', '报告', '在哪', '哪里'],
  },
  {
    kind: 'report',
    risk: 'external-action',
    keywords: ['周报', '本周汇报', '本周总结', '这周做了什么', '本周做了什么', '写周报', '周总结', '明天先干什么'],
  },
  {
    kind: 'settings',
    risk: 'reversible',
    keywords: [
      '系统设置',
      '打开设置',
      '去设置',
      '设置面板',
      '通知都静音',
      '所有通知',
      '全部通知',
      '免打扰所有',
      '关掉通知',
      '通知频率',
      '把通知都静音',
      '设置',
    ],
  },
  {
    kind: 'focus',
    risk: 'reversible',
    keywords: ['专注', '别打扰', '不要打扰', '勿扰', '深度工作', '静音'],
  },
  // —— PRD v0.2 生活场景，保留以维持同一入口的多场景演示 ——
  { kind: 'weather', risk: 'informational', keywords: ['天气', 'weather'] },
  { kind: 'music', risk: 'informational', keywords: ['歌', '音乐', 'music', '播放'] },
  { kind: 'timer', risk: 'reversible', keywords: ['计时', '定时', 'timer'] },
  { kind: 'reminder', risk: 'reversible', keywords: ['提醒', 'remind'] },
  { kind: 'note', risk: 'reversible', keywords: ['笔记', '记一下', 'note'] },
  { kind: 'route', risk: 'informational', keywords: ['路线', '怎么走', 'route'] },
]

/** AI 复述 — "听+懂协议"里的"懂"（PRD v1.0 §4.3 用户旅程） */
const INTENT_ACK: Record<IntentKind, string> = {
  brief: '明白，我把邮件、消息和今天的会议汇总成一份晨间简报。',
  email: '好的，正在按发件人和紧急程度给收件箱排序。',
  meeting: '收到，我把会议的决策和行动项整理成结构化纪要。',
  message: '好的，正在汇总频道里和你相关的讨论。',
  doc: '明白，跨邮件附件、云盘和会议记录帮你找。',
  focus: '好的，进入深度工作模式，非 VIP 通知我先替你挡着。',
  report: '好的，正在汇总本周的提交、任务、会议和文档产出。',
  settings: '好的，正在按你的话调整系统设置。',
  weather: '好的，正在查询天气。',
  music: '好的，正在为你挑选合适的音乐。',
  timer: '好的，计时器已就绪。',
  reminder: '好的，我先复述一遍你的提醒，确认后再生效。',
  note: '好的，已记下。',
  search: '好的，正在检索。',
  route: '好的，正在规划路线。',
}

export interface RouteResult extends Intent {
  /** AI 复述文本 */
  ack: string
  /** 是否命中回复动作（邮件场景的 external-action 子分支） */
  replyMode: boolean
}

/** 路由用户输入 → 意图 */
export function routeIntent(rawText: string): RouteResult | null {
  const text = rawText.toLowerCase()

  for (const rule of RULES) {
    if (rule.keywords.some((k) => text.includes(k.toLowerCase()))) {
      return {
        kind: rule.kind,
        entities: { rawText },
        confidence: 0.9,
        risk: rule.risk,
        rawText,
        ack: INTENT_ACK[rule.kind],
        replyMode: rule.kind === 'email' && /回复|回信|回一封|reply/.test(text),
      }
    }
  }
  return null
}

/** 未命中时的澄清话术 */
export function clarificationText(rawText: string): string {
  return `我没完全理解「${rawText}」。你可以试试：今天有什么重要的 / 看看重要邮件 / 整理会议纪要 / 团队今天聊了什么。`
}

export { INTENT_ACK }
