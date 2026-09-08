import type { IntentKind } from '../components/orb/OrbState'

/**
 * 提示词库（PRD v1.0 §4 全场景覆盖）
 *
 * 按意图场景分类，用户直接点击即派发对应意图，无需手敲 query。
 * 每个场景给出多个真实可响应的 phrasing，覆盖 PRD 中的打工人高频诉求。
 */

export interface PromptItem {
  /** 按钮上展示的口语化文案 */
  label: string
  /** 实际派发的 query（会经过 IntentRouter 命中同一场景） */
  text: string
}

export interface PromptGroup {
  kind: IntentKind
  title: string
  icon: string
  items: PromptItem[]
}

export const PROMPT_LIBRARY: PromptGroup[] = [
  {
    kind: 'brief',
    title: '晨间简报',
    icon: 'wb_sunny',
    items: [
      { label: '今天有什么重要的？', text: '今天有什么重要的' },
      { label: '给我一份晨间简报', text: '给我一份晨间简报' },
      { label: '早上好，今天怎么安排', text: '早上好，今天怎么安排' },
    ],
  },
  {
    kind: 'email',
    title: '邮件助手',
    icon: 'mail',
    items: [
      { label: '看看重要邮件', text: '看看有什么重要邮件' },
      { label: '帮回复 CEO 的邮件', text: '帮我回复 CEO 的邮件' },
      { label: '收件箱里哪些要我回复', text: '收件箱里哪些要我回复' },
    ],
  },
  {
    kind: 'meeting',
    title: '会议纪要',
    icon: 'groups',
    items: [
      { label: '整理刚才的会议纪要', text: '会议结束了，帮我整理纪要' },
      { label: '把评审会结论发给团队', text: '把评审会结论发邮件给大家' },
      { label: '会议决策同步到 Jira', text: '会议决策同步到 Jira' },
      { label: '准备一下 10 点的评审会', text: '准备一下10点的产品评审会' },
    ],
  },
  {
    kind: 'message',
    title: '沟通摘要',
    icon: 'forum',
    items: [
      { label: '团队今天聊了什么', text: '今天团队聊了什么' },
      { label: '#project-alpha 提到我什么', text: '#project-alpha 提到我什么' },
      { label: '飞书里有没有要我跟进的', text: '飞书里有没有要我跟进的' },
    ],
  },
  {
    kind: 'doc',
    title: '文档检索',
    icon: 'search',
    items: [
      { label: '上季度增长复盘在哪', text: '上季度的增长复盘在哪' },
      { label: '找一下 Q3 预算文档', text: '找一下 Q3 预算文档' },
      { label: '搜索竞品分析', text: '搜索竞品分析相关的文档' },
    ],
  },
  {
    kind: 'focus',
    title: '深度工作',
    icon: 'shield',
    items: [
      { label: '进入深度工作，别打扰我', text: '进入深度工作，别打扰我' },
      { label: '专注 90 分钟', text: '专注 90 分钟' },
    ],
  },
  {
    kind: 'report',
    title: '智能周报',
    icon: 'summarize',
    items: [
      { label: '生成本周周报', text: '生成本周周报' },
      { label: '这周我做了什么', text: '这周我做了什么' },
    ],
  },
  {
    kind: 'settings',
    title: '系统设置',
    icon: 'tune',
    items: [
      { label: '把通知都静音', text: '把通知都静音' },
      { label: '打开系统设置', text: '打开系统设置面板' },
    ],
  },
]
