import type { DocResult } from '../agents/types'

/**
 * 文档检索 mock（PRD v1.0 §4.2.5 — 跨源语义搜索）
 */
export const MOCK_DOCS: DocResult[] = [
  {
    id: 'doc1',
    name: 'Q3 用户增长复盘.pdf',
    source: '云盘 · 战略组',
    snippet: 'Q3 新增用户 42 万，自然流量占比提升至 38%，主要贡献来自内容矩阵改版。',
    relevance: 0.96,
    updated: '9 月 2 日',
  },
  {
    id: 'doc2',
    name: '用户增长实验台账.xlsx',
    source: '邮件附件 · 张三',
    snippet: '近 12 周 A/B 实验汇总，其中 5 个实验达到显著，主口径为次留与付费转化。',
    relevance: 0.88,
    updated: '9 月 5 日',
  },
  {
    id: 'doc3',
    name: 'Q3 增长策略评审会议纪要',
    source: '会议 · 8 月 28 日',
    snippet: '决定把预算向内容矩阵倾斜，暂停两个低效渠道的投放。',
    relevance: 0.74,
    updated: '8 月 28 日',
  },
]
