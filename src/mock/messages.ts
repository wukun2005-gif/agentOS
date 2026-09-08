import type { MessageDigest } from '../agents/types'

/**
 * 工作沟通 mock（PRD v1.0 §4.2.4 — #project-alpha 频道过去 24 小时）
 */
export const MOCK_DIGEST: MessageDigest = {
  id: 'c1',
  channel: '#project-alpha',
  window: '过去 24 小时',
  unread: 47,
  mentions: 2,
  highlights: [
    {
      id: 'h1',
      from: '张三',
      text: 'API 版本策略要不要跟 v2 一起发？等你确认。',
      time: '09:12',
      mention: true,
    },
    {
      id: 'h2',
      from: '李四',
      text: '测试环境昨晚挂了，已恢复，不影响今天的评审。',
      time: '08:35',
      mention: false,
    },
    {
      id: 'h3',
      from: '王五',
      text: '设计稿今晚上传到 Figma，明天评审前能看完吗？',
      time: '17:40',
      mention: true,
    },
  ],
  extractedTasks: ['确认 API 版本策略（与张三，今天）', '评审 UI 设计稿（与王五，明天 10:00）'],
}

/** @我的未读消息数 */
export const MENTION_COUNT = MOCK_DIGEST.mentions
