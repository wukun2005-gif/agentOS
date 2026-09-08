import type { Artifact } from '../orb/OrbState'
import { CardButton, CardFrame } from './CardFrame'
import { useOrbStore } from '../../store/useOrbStore'

/**
 * 深度工作卡片（PRD v1.0 §4.2.6 深度工作保护）
 *
 * 展示屏障策略：被屏蔽的通知类型 / 仅放行的紧急类型。
 * 「结束专注」退出专注态，恢复全部通知。
 */
export function FocusCard({ artifact }: { artifact: Artifact }) {
  const dismissArtifact = useOrbStore((s) => s.dismissArtifact)
  const setFocusMode = useOrbStore((s) => s.setFocusMode)

  const data = artifact.data
  if (!data || data.type !== 'focus') return null
  const { session } = data

  const handleEnd = () => {
    setFocusMode(false)
    dismissArtifact(artifact.id)
  }

  return (
    <CardFrame
      icon="shield"
      title="深度工作"
      badge="FOCUS"
      tone="primary"
      onClose={handleEnd}
      actions={
        <CardButton variant="primary" icon="play_arrow" onClick={handleEnd}>
          结束专注
        </CardButton>
      }
    >
      <div className="focus-duration">
        <span className="material-symbols-outlined">timer</span>
        专注 {session.durationLabel}
      </div>

      <div className="focus-section">
        <div className="focus-section-label muted">已屏蔽</div>
        <div className="focus-chips dim">
          {session.blocked.map((b) => (
            <span className="focus-chip" key={b}>
              {b}
            </span>
          ))}
        </div>
      </div>

      <div className="focus-section">
        <div className="focus-section-label">仅放行</div>
        <div className="focus-chips">
          {session.allowThrough.map((a) => (
            <span className="focus-chip allow" key={a}>
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className="focus-foot">非 VIP 通知已替你挡着，专心干这 {session.durationLabel}。</div>
    </CardFrame>
  )
}
