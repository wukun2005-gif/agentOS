import { useOrbStore } from '../../store/useOrbStore'
import type { Artifact } from '../orb/OrbState'
import { CardButton, CardFrame } from './CardFrame'
import './ListCard.css'

/**
 * 通用清单卡片（PRD v1.0 §4 具体子诉求）
 *
 * 用一份 ListResult 数据契约承载所有"具体子诉求"（拍板事项 / 超时邮件 /
 * 会议价值评估 / 群结论等），避免给每个 prompt 写一张专用卡片。
 *
 * confirmLabel 存在 → 卡片进入待确认态（external-action 二次确认），
 * 用户确认后才标记完成（PRD §4.1 风险分级）。
 */
export function ListCard({ artifact }: { artifact: Artifact }) {
  const updateArtifact = useOrbStore((s) => s.updateArtifact)
  const dismissArtifact = useOrbStore((s) => s.dismissArtifact)
  const addTimeSaved = useOrbStore((s) => s.addTimeSaved)
  const pushNotification = useOrbStore((s) => s.pushNotification)

  const data = artifact.data
  if (!data || data.type !== 'list') return null
  const result = data.result
  const done = artifact.status === 'complete'

  /** external-action 二次确认 */
  const handleConfirm = () => {
    updateArtifact(artifact.id, { status: 'complete' })
    if (result.savedMinutes) addTimeSaved(result.savedMinutes)
    pushNotification({
      icon: 'check_circle',
      title: result.doneLabel ?? '已完成',
      detail: result.savedMinutes ? `节省 ${result.savedMinutes} 分钟` : '',
      tone: 'success',
    })
  }

  return (
    <CardFrame
      icon="list_alt"
      title={result.title}
      badge="LIST"
      tone={done ? 'success' : 'primary'}
      onClose={() => dismissArtifact(artifact.id)}
      actions={
        result.confirmLabel
          ? done
            ? (
              <CardButton variant="done" icon="check_circle" onClick={() => dismissArtifact(artifact.id)}>
                完成
              </CardButton>
            )
            : (
              <CardButton variant="primary" icon="auto_awesome" onClick={handleConfirm}>
                {result.confirmLabel}
              </CardButton>
            )
          : undefined
      }
    >
      {result.subtitle && <div className="list-subtitle">{result.subtitle}</div>}

      <div className="list-items">
        {result.items.map((it) => (
          <div className={`list-item ${it.tone ?? ''}`} key={it.id}>
            <span className="material-symbols-outlined list-item-icon">{it.icon}</span>
            <div className="list-item-main">
              <div className="list-item-title">{it.title}</div>
              {it.detail && <div className="list-item-detail">{it.detail}</div>}
            </div>
            {it.tag && <span className={`list-item-tag ${it.tone ?? ''}`}>{it.tag}</span>}
          </div>
        ))}
      </div>

      {result.savedMinutes ? (
        <div className="saved-row">
          本项节省 <strong>{result.savedMinutes} 分钟</strong>
        </div>
      ) : null}

      {done && result.doneLabel ? <div className="list-done">{result.doneLabel}</div> : null}
    </CardFrame>
  )
}
