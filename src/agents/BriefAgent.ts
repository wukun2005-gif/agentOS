import { PENDING_REPLY_COUNT, UNREAD_MAIL_COUNT } from '../mock/emails'
import { TODAY_MEETING_COUNT } from '../mock/meetings'
import { MENTION_COUNT } from '../mock/messages'
import { SAVED_MINUTES, type BriefItem, type MorningBrief } from './types'

/**
 * 晨间简报 Agent（PRD v1.0 §4.2.1）
 *
 * 聚合邮件 / IM / 日历 / 任务四源，AI 判断优先级后生成 3-5 条关键事项。
 * 价值量化：原来 60 分钟晨间处理 → 5 分钟掌握全天，节省 55 分钟。
 */
export function getMorningBrief(): MorningBrief {
  const items: BriefItem[] = [
    {
      id: 'b1',
      type: 'email',
      icon: 'mail',
      label: 'VIP 邮件',
      title: 'CEO · Q3 预算调整',
      detail: '市场费用需削减 20%，今晚前确认研发预算是否保留。',
      urgent: true,
    },
    {
      id: 'b2',
      type: 'message',
      icon: 'alternate_email',
      label: '@ 你',
      title: '张三 · API 版本策略',
      detail: '等你确认 v2 是否一起发，阻塞前端排期。',
      urgent: true,
    },
    {
      id: 'b3',
      type: 'meeting',
      icon: 'groups',
      label: '30 分钟后',
      title: '10:00 产品评审会',
      detail: '3 份材料已备好：需求文档 v2.3、技术方案、上周纪要。',
      urgent: false,
    },
    {
      id: 'b4',
      type: 'task',
      icon: 'task_alt',
      label: '今日待办',
      title: '3 项行动项待跟进',
      detail: '更新项目计划书（王五，9/12）最早到期。',
      urgent: false,
    },
  ]

  return {
    date: '9 月 8 日 · 周二',
    greeting: '早上好',
    summary: `今天有 ${UNREAD_MAIL_COUNT} 封未读、${MENTION_COUNT} 条 @ 你、${TODAY_MEETING_COUNT} 个会议，${PENDING_REPLY_COUNT} 封需要你回复。`,
    stats: [
      { label: '待处理邮件', value: String(UNREAD_MAIL_COUNT), tone: 'primary' },
      { label: '@ 我', value: String(MENTION_COUNT), tone: 'warn' },
      { label: '今日会议', value: String(TODAY_MEETING_COUNT), tone: 'muted' },
      { label: '待回复', value: String(PENDING_REPLY_COUNT), tone: 'warn' },
    ],
    items,
    savedMinutes: SAVED_MINUTES.brief,
  }
}
