import { MOCK_DOCS } from '../mock/documents'
import type { DocResult } from './types'

/**
 * 文档 Agent（PRD v1.0 §4.2.5 语义搜索）
 *
 * Demo 阶段按查询词做轻量打分，产出跨源结果。
 */
export function searchDocuments(query: string): DocResult[] {
  const keywords = query.replace(/[的了吗呢啊，。,.?!？！]/g, '').slice(0, 12)
  return [...MOCK_DOCS]
    .map((doc) => {
      const hit = [...keywords].some((ch) => doc.name.includes(ch) || doc.snippet.includes(ch))
      return { ...doc, relevance: hit ? doc.relevance : Math.max(0.4, doc.relevance - 0.25) }
    })
    .sort((a, b) => b.relevance - a.relevance)
}
