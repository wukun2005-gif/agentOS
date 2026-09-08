import { MOCK_EMAILS } from '../mock/emails'

/**
 * 邮件 Agent（PRD v1.0 §4.2.2）
 *
 * 模拟"智能分类 → 优先级排序 → 一键回复"三段流程。
 * 真实实现应接入 LLM + 邮件 API，Demo 阶段用关键词命中 + 预置草稿。
 */

/** 分类权重的排序口径：VIP 决策 > 需要回复 > 可稍后 > 自动归档 */
const PRIORITY_ORDER = { vip: 0, reply: 1, later: 2, auto: 3 } as const

/** 智能分类 + 优先级排序后的收件箱 */
export function triageInbox(): typeof MOCK_EMAILS {
  return [...MOCK_EMAILS].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.time.localeCompare(a.time),
  )
}

/** 需要人工回复的邮件 */
export function pendingReplies() {
  return triageInbox().filter((e) => e.needsReply)
}

/** 需要立即决策的 VIP 邮件 */
export function vipEmails() {
  return triageInbox().filter((e) => e.priority === 'vip')
}

/**
 * 从用户输入中挑选目标邮件
 * 命中发件人/角色/主题关键词则定位，否则返回优先级最高的一封。
 */
export function pickEmail(rawText: string) {
  const text = rawText.toLowerCase()
  const list = triageInbox()

  const hits: Array<{ key: string; id: string }> = [
    { key: 'ceo', id: 'e1' },
    { key: '陈总', id: 'e1' },
    { key: '老板', id: 'e1' },
    { key: '预算', id: 'e1' },
    { key: '客户', id: 'e2' },
    { key: 'acme', id: 'e2' },
    { key: '合同', id: 'e2' },
    { key: '王总', id: 'e2' },
    { key: '接口', id: 'e3' },
    { key: 'api', id: 'e3' },
    { key: '张三', id: 'e3' },
  ]

  for (const hit of hits) {
    if (text.includes(hit.key)) {
      const found = list.find((e) => e.id === hit.id)
      if (found) return found
    }
  }
  return list[0]
}

/** 生成回复草稿（模拟 LLM 基于邮件上下文生成） */
export function composeReply(email: (typeof MOCK_EMAILS)[number]) {
  return email.draft ?? `关于《${email.subject}》，我这边确认无误，稍后同步进展。`
}
