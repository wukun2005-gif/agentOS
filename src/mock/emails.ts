import type { MockEmail } from '../agents/types'

/**
 * 邮件 mock（PRD v1.0 §4.2.2 用户旅程）
 *
 * CEO 邮件与合同邮件构成"VIP · 需决策"，接口评审构成"需要回复"，
 * 系统通知与全员邮件构成"可稍后 / 自动归档"。
 */
export const MOCK_EMAILS: MockEmail[] = [
  {
    id: 'e1',
    from: '陈总',
    role: 'CEO',
    subject: 'Q3 预算调整（今晚前确认）',
    preview: '市场费用需要削减 20%，请确认研发预算是否保留，今晚前给我答复。',
    priority: 'vip',
    time: '08:42',
    unread: true,
    needsReply: true,
    draft:
      '收到。同意削减 20% 市场费用，研发预算保持不变。已同步财务部门按新口径执行，本周五前给出调整后的 Q3 预算表。',
  },
  {
    id: 'e2',
    from: '王总',
    role: 'Acme 客户',
    subject: '合同续签条款确认',
    preview: '希望把付款周期从 30 天调整为 45 天，其余条款不变。',
    priority: 'vip',
    time: '08:10',
    unread: true,
    needsReply: true,
    draft:
      '感谢确认。45 天付款周期我们可以接受，法务本周内出具修订版合同，如无异议下周一走签署流程。',
  },
  {
    id: 'e3',
    from: '张三',
    role: '产品',
    subject: 'API 接口设计评审',
    preview: 'v2 接口文档已更新到最新的字段口径，请在明天评审前给出意见。',
    priority: 'reply',
    time: '09:05',
    unread: true,
    needsReply: true,
    draft: '文档已看，v2 的分页字段我建议沿用 cursor 方案，明天会上过一遍细节。',
  },
  {
    id: 'e4',
    from: '李四',
    role: '测试',
    subject: '测试环境昨晚异常已恢复',
    preview: '凌晨 2 点测试环境挂了，已重启并完成回归，不影响今天的评审。',
    priority: 'later',
    time: '07:40',
    unread: false,
    needsReply: false,
  },
  {
    id: 'e5',
    from: 'Jira 通知',
    role: '自动化',
    subject: '[AURA-142] 登录改版已合并',
    preview: 'PR #318 已合并到 main，关联需求已自动流转到待验收。',
    priority: 'auto',
    time: '07:30',
    unread: false,
    needsReply: false,
  },
  {
    id: 'e6',
    from: 'HR 全员',
    role: '行政',
    subject: '本月福利与报销说明',
    preview: '本月报销截止 25 日，福利平台新增体检预约入口。',
    priority: 'auto',
    time: '07:05',
    unread: false,
    needsReply: false,
  },
]

/** 收件箱未读数 */
export const UNREAD_MAIL_COUNT = MOCK_EMAILS.filter((e) => e.unread).length

/** 需要人工决策/回复的邮件 */
export const PENDING_REPLY_COUNT = MOCK_EMAILS.filter((e) => e.needsReply).length
