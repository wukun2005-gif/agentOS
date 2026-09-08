import { useOrbStore } from '../../store/useOrbStore'
import type { Artifact } from '../orb/OrbState'
import { CardFrame } from './CardFrame'

/**
 * 晨间简报卡片（PRD v1.0 §4.2.1 智能晨间简报）
 *
 * 一张卡承载 3-4 条关键事项 + 四项统计，配一条量化价值：
 * 原来 60 分钟晨间处理 → 5 分钟掌握全天，节省 55 分钟。
 */
export function BriefCard({ artifact }: { artifact: Artifact }) {
  const dismissArtifact = useOrbStore((s) => s.dismissArtifact)

  const data = artifact.data
  if (!data || data.type !== 'brief') return null
  const { brief } = data

  return (
    <CardFrame
      icon="wb_sunny"
      title="晨间简报"
      badge="BRIEF"
      tone="primary"
      wide
      onClose={() => dismissArtifact(artifact.id)}
    >
      <div className="brief-head">
        <div className="brief-greeting">
          {brief.greeting} · {brief.date}
        </div>
        <div className="brief-summary">{brief.summary}</div>
      </div>

      <div className="brief-stats">
        {brief.stats.map((s) => (
          <div className={`brief-stat ${s.tone}`} key={s.label}>
            <span className="brief-stat-value">{s.value}</span>
            <span className="brief-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="brief-list">
        {brief.items.map((item) => (
          <div className={`brief-item ${item.urgent ? 'urgent' : ''}`} key={item.id}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <div className="brief-item-main">
              <div className="brief-item-title">
                <span className="brief-item-label">{item.label}</span>
                {item.title}
              </div>
              <div className="brief-item-detail">{item.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="saved-row">
        晨间处理从 60 分钟 → 5 分钟，本项节省 <strong>{brief.savedMinutes} 分钟</strong>
      </div>
    </CardFrame>
  )
}
