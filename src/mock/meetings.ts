import type { MeetingMinutes } from '../agents/types'

/**
 * 会议 mock（PRD v1.0 §4.2.3 / §4.3 用户旅程 10:00 产品评审会）
 */
export const MOCK_MINUTES: MeetingMinutes = {
  id: 'm1',
  title: '产品评审会',
  date: '今天',
  time: '10:00 - 11:30',
  duration: '90 分钟',
  attendees: ['你', '张三', '李四', '王五'],
  decisions: [
    '采用方案 A（渐进式迁移），放弃整体重写',
    '预算追加 20 万，用于数据迁移与灰度',
    '上线时间锁定 10 月 15 日',
  ],
  actionItems: [
    { id: 'a1', text: '完成 UI 设计稿 v3', owner: '张三', due: '9/20' },
    { id: 'a2', text: '协调测试资源', owner: '李四', due: '9/15' },
    { id: 'a3', text: '更新项目计划书', owner: '王五', due: '9/12' },
  ],
  docs: [
    { id: 'd1', name: '需求文档 v2.3', kind: 'PRD' },
    { id: 'd2', name: '技术方案评审记录', kind: '技术方案' },
    { id: 'd3', name: '上周会议纪要', kind: '纪要' },
  ],
}

/** 今日会议数（系统托盘 / Dock 徽标） */
export const TODAY_MEETING_COUNT = 5
