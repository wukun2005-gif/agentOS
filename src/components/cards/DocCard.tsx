import { useOrbStore } from '../../store/useOrbStore'
import type { Artifact } from '../orb/OrbState'
import { CardFrame } from './CardFrame'

/**
 * 文档检索卡片（PRD v1.0 §4.2.5 语义搜索）
 * 跨邮件附件 / 云盘 / 会议记录三源聚合
 */
export function DocCard({ artifact }: { artifact: Artifact }) {
  const dismissArtifact = useOrbStore((s) => s.dismissArtifact)

  const data = artifact.data
  if (!data || data.type !== 'doc') return null

  return (
    <CardFrame
      icon="search"
      title="文档检索"
      badge="DOCS"
      tone="primary"
      onClose={() => dismissArtifact(artifact.id)}
    >
      <div className="doc-query">
        <span className="intent-card-desc">跨源语义检索 · </span>
        <span className="doc-query-text">{data.query}</span>
      </div>

      <div className="doc-results">
        {data.results.map((r) => (
          <div className="doc-result" key={r.id}>
            <div className="doc-result-head">
              <span className="material-symbols-outlined">description</span>
              <span className="doc-result-name">{r.name}</span>
              <span className="doc-result-relevance">{Math.round(r.relevance * 100)}%</span>
            </div>
            <div className="doc-result-snippet">{r.snippet}</div>
            <div className="doc-result-meta">
              {r.source} · 更新于 {r.updated}
            </div>
          </div>
        ))}
      </div>

      <div className="saved-row">3 个来源聚合 · 相比手动查找节省 16 分钟</div>
    </CardFrame>
  )
}
