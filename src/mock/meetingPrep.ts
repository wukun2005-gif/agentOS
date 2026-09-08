import type { MeetingPrep } from '../agents/types'

/**
 * 会议会前准备 mock（PRD v1.0 §4.2.3 / §4.3 用户旅程「9:55 准备一下10点的产品评审会」）
 */
export const MOCK_PREP: MeetingPrep = {
  id: 'prep1',
  title: '产品评审会',
  time: '10:00 - 11:30',
  duration: '90 分钟',
  agenda: [
    '方案 A（渐进式迁移）可行性复核',
    'Q3 预算追加 20 万的使用明细',
    '上线时间是否锁定 10/15',
    '测试资源协调与灰度方案',
  ],
  docsToRead: [
    { id: 'pd', name: '需求文档 v2.3', kind: 'PRD', mins: 8 },
    { id: 'td', name: '技术方案评审记录', kind: '技术方案', mins: 12 },
    { id: 'lm', name: '上周会议纪要', kind: '纪要', mins: 5 },
  ],
  attendees: [
    { name: '张三', prep: '确认 UI 设计稿 v3 能否 9/20 交付' },
    { name: '李四', prep: '对齐测试资源排期（9/15 前）' },
    { name: '王五', prep: '同步项目计划书更新进度' },
  ],
  openLoops: ['数据迁移方案未定稿', '灰度回滚预案待补充'],
  risks: ['预算审批尚未走完，上线时间有顺延风险', '测试环境资源紧张'],
}
