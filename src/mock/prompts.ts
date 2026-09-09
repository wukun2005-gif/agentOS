import type { IntentKind } from '../components/orb/OrbState'

/**
 * 提示词库（PRD v1.0 §2 调研发现 + §4 全场景覆盖）
 *
 * 编写原则：每条 prompt 必须锚定 PRD §2 中一个**具体的三高摩擦点**
 * （高频 / 高摩擦 / 高价值），而不是同一意图的同义反复。
 *
 * 所有文案均通过 scripts/verify-prompts.ts 校验，确保能被 IntentRouter
 * 命中到期望的 kind 与**产物子分支**（标注了 expect 的条目会进一步断言
 * buildArtifacts 的真实产物类型，杜绝"意图对、产物货不对板"）。
 * 改动后请执行 `npm run verify:prompts`。
 */

export interface PromptItem {
  /** 按钮上展示的口语化文案 */
  label: string
  /** 实际派发的 query（会经过 IntentRouter 命中同一场景） */
  text: string
  /**
   * 期望的子分支行为（可选）。用于校验脚本断言真实产物类型，
   * 避免"意图命中对了、但产物不是用户想要的那一个"。
   *
   * 形如 'list:brief-meetingValue' 表示应产出 id 为该值的通用清单产物；
   * 形如 'prep' / 'reply' / 'dnd' / 'open' 表示特定产物变体。
   */
  expect?:
    | 'prep'
    | 'reply'
    | 'dnd'
    | 'open'
    | 'list:brief-decisions'
    | 'list:brief-schedule'
    | 'list:brief-overnight'
    | 'list:brief-meetingValue'
    | 'list:email-overdue'
    | 'list:email-urgency'
    | 'list:email-archive'
    | 'list:email-decline'
    | 'list:meeting-myActions'
    | 'list:meeting-decline'
    | 'list:meeting-sync'
    | 'list:message-mentions'
    | 'list:message-awaiting'
    | 'list:message-takeaways'
    | 'list:message-followups'
    | 'list:doc-latest'
    | 'list:doc-highlights'
    | 'list:doc-changes'
    | 'list:report-blockers'
    | 'list:report-todayReview'
}

export interface PromptGroup {
  kind: IntentKind
  title: string
  icon: string
  /** PRD §2 三高依据（高频/高摩擦/高价值），展示在分组标题旁，说明该场景为何值得 AI 代劳 */
  friction: string
  items: PromptItem[]
}

export const PROMPT_LIBRARY: PromptGroup[] = [
  {
    kind: 'brief',
    title: '晨间简报',
    icon: 'wb_sunny',
    friction: '117 封邮件 + 153 条消息 / 天，优先级判断困难',
    items: [
      { label: '今天有什么必须我拍板的？', text: '今天有什么必须我拍板的？', expect: 'list:brief-decisions' },
      { label: '帮我安排一下今天的日程', text: '帮我安排一下今天的日程', expect: 'list:brief-schedule' },
      { label: '早上好，昨晚有什么紧急的', text: '早上好，昨晚有什么紧急的', expect: 'list:brief-overnight' },
      { label: '今天 8 个会，哪些可以不去？', text: '今天 8 个会，哪些其实可以不去', expect: 'list:brief-meetingValue' },
      { label: '给我一份晨间简报', text: '给我一份晨间简报' },
    ],
  },
  {
    kind: 'email',
    title: '邮件助手',
    icon: 'mail',
    friction: '占 28% 工作周，跟进遗漏高发',
    items: [
      { label: '帮我回复 CEO 的邮件', text: '帮我回复 CEO 的邮件', expect: 'reply' },
      { label: '哪些邮件拖了 3 天还没回？', text: '哪些邮件拖了 3 天还没回', expect: 'list:email-overdue' },
      { label: '收件箱 117 封，按紧急排一下', text: '收件箱 117 封，按紧急程度排一下', expect: 'list:email-urgency' },
      { label: '把不重要的邮件批量归档', text: '把不重要的邮件批量归档', expect: 'list:email-archive' },
      { label: '帮我起草一封婉拒的邮件', text: '帮我起草一封婉拒的邮件', expect: 'list:email-decline' },
    ],
  },
  {
    kind: 'meeting',
    title: '会议',
    icon: 'groups',
    friction: '5-8 个 / 天，占 40-60% 工作周，准备不足 + 行动项追踪难',
    items: [
      { label: '会议结束了，帮我整理纪要', text: '会议结束了，帮我整理纪要' },
      { label: '刚才的会哪些 action 归我？', text: '刚才的会议里哪些 action 归我', expect: 'list:meeting-myActions' },
      { label: '准备一下 10 点的评审会', text: '准备一下10点的产品评审会', expect: 'prep' },
      { label: '这个会邮件就能说清，帮我推掉', text: '这场会议一封邮件就能说清，帮我推掉', expect: 'list:meeting-decline' },
      { label: '把评审会结论同步给没参会的', text: '把评审会结论同步给没参会的同学', expect: 'list:meeting-sync' },
    ],
  },
  {
    kind: 'message',
    title: '沟通摘要',
    icon: 'forum',
    friction: '153 条 / 天，实时响应压力 + 结论沉没',
    items: [
      { label: '今天团队聊了什么', text: '今天团队聊了什么' },
      { label: '#project-alpha 提到我什么', text: '#project-alpha 提到我什么', expect: 'list:message-mentions' },
      { label: '群里谁还在等我答复？', text: '群里谁还在等我答复', expect: 'list:message-awaiting' },
      { label: '把群里今天的结论整理成要点', text: '把群里今天的结论整理成要点', expect: 'list:message-takeaways' },
      { label: '飞书里有没有要我跟进的', text: '飞书里有没有要我跟进的', expect: 'list:message-followups' },
    ],
  },
  {
    kind: 'doc',
    title: '文档检索',
    icon: 'search',
    friction: '10-20 份 / 天，版本混乱 + 长文档耗时',
    items: [
      { label: '上季度的增长复盘在哪', text: '上季度的增长复盘在哪' },
      { label: '找一下最新版本，别给旧版', text: '找一下最新版本，别给我旧版', expect: 'list:doc-latest' },
      { label: '这份 40 页文档帮我提炼要点', text: '这份 40 页的文档帮我提炼要点', expect: 'list:doc-highlights' },
      { label: '找一下 Q3 预算文档', text: '找一下 Q3 预算文档' },
      { label: '谁最近改过这份文档？', text: '谁最近改过这份文档', expect: 'list:doc-changes' },
    ],
  },
  {
    kind: 'focus',
    title: '深度工作',
    icon: 'shield',
    friction: '平均专注 13 分 7 秒，每 2 分钟被打断',
    items: [
      { label: '专注 120 分钟写 PRD，别打扰', text: '专注 120 分钟写 PRD，别打扰我' },
      { label: '专注 90 分钟', text: '专注 90 分钟' },
      { label: '进入深度工作，只放行老板', text: '进入深度工作，别打扰我，只放行老板' },
      { label: '重新专注，恢复刚才的上下文', text: '重新专注，帮我恢复刚才的上下文' },
    ],
  },
  {
    kind: 'report',
    title: '周报复盘',
    icon: 'summarize',
    friction: '复盘流于形式、记录不完整、阻碍无人跟踪',
    items: [
      { label: '生成本周周报', text: '生成本周周报' },
      { label: '这周做了什么，写成周报发老板', text: '这周做了什么，帮我写成周报发给老板' },
      { label: '本周总结里标出卡住的事', text: '本周总结里帮我标出卡住的事', expect: 'list:report-blockers' },
      { label: '今天做了什么？明天先干什么？', text: '今天做了什么？明天先干什么？', expect: 'list:report-todayReview' },
    ],
  },
  {
    kind: 'settings',
    title: '系统设置',
    icon: 'tune',
    friction: '通知过载，打断深度工作',
    items: [
      { label: '把通知都静音', text: '把通知都静音', expect: 'dnd' },
      { label: '打开系统设置', text: '打开系统设置面板', expect: 'open' },
    ],
  },
]
