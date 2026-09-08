import { useOrbStore } from '../../store/useOrbStore'
import type { Artifact } from '../orb/OrbState'
import { BriefCard } from './BriefCard'
import { CardButton, CardFrame } from './CardFrame'
import { DocCard } from './DocCard'
import { EmailCard } from './EmailCard'
import { FocusCard } from './FocusCard'
import { LegacyCard } from './LegacyCard'
import { MeetingCard } from './MeetingCard'
import { MeetingPrepCard } from './MeetingPrepCard'
import { MessageCard } from './MessageCard'
import { ReportCard } from './ReportCard'
import { SettingCard } from './SettingCard'
import './IntentCard.css'

/**
 * 产物层 — 任务卡片的空间化呈现（PRD v0.2 §6 + PRD v1.0 §4）
 *
 * 三层空间槽位：slot-0 右侧近场 / slot-1 左侧近场 / slot-2 右下远场。
 * 卡片由 Agent 产出后停靠在槽位上，不随新任务跳位，只有关闭或退场才迁移。
 */

const OFFICE_KINDS = new Set(['brief', 'email', 'meeting', 'message', 'doc', 'prep', 'setting'])

function renderArtifact(artifact: Artifact, rawText: string) {
  const hasData = !!artifact.data

  if (artifact.kind === 'clarification') {
    return (
      <CardFrame
        icon="help"
        title={artifact.title ?? '需要澄清'}
        badge="CLARIFY"
        tone="warn"
        onClose={() => useOrbStore.getState().dismissArtifact(artifact.id)}
        actions={
          <CardButton
            onClick={() => {
              useOrbStore.getState().dismissArtifact(artifact.id)
              useOrbStore.getState().setOrbState('idle')
            }}
          >
            换个说法
          </CardButton>
        }
      >
        <div className="intent-card-desc">{artifact.message}</div>
      </CardFrame>
    )
  }

  if (!hasData && !OFFICE_KINDS.has(artifact.kind)) {
    return <LegacyCard artifact={artifact} rawText={rawText} />
  }

  switch (artifact.kind) {
    case 'brief':
      return <BriefCard artifact={artifact} />
    case 'email':
      return <EmailCard artifact={artifact} />
    case 'meeting':
      return <MeetingCard artifact={artifact} />
    case 'prep':
      return <MeetingPrepCard artifact={artifact} />
    case 'setting':
      return <SettingCard artifact={artifact} />
    case 'message':
      return <MessageCard artifact={artifact} />
    case 'doc':
      return <DocCard artifact={artifact} />
    case 'report':
      return <ReportCard artifact={artifact} />
    case 'focus':
      return <FocusCard artifact={artifact} />
    default:
      return <LegacyCard artifact={artifact} rawText={rawText} />
  }
}

export function IntentCard() {
  const artifacts = useOrbStore((s) => s.artifacts)
  const transcript = useOrbStore((s) => s.transcript)
  const updateArtifact = useOrbStore((s) => s.updateArtifact)

  if (artifacts.length === 0) return null

  /** 拖拽移动（从卡片头部发起，PRD §5.1 P1 窗口管理） */
  const startDrag = (e: React.PointerEvent, artifact: Artifact) => {
    const startX = e.clientX
    const startY = e.clientY
    const orig = artifact.pos ?? { x: 0, y: 0 }
    const move = (ev: PointerEvent) => {
      updateArtifact(artifact.id, {
        pos: { x: orig.x + (ev.clientX - startX), y: orig.y + (ev.clientY - startY) },
      })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  /** 缩放窗口（从右下角手柄发起） */
  const startResize = (e: React.PointerEvent, artifact: Artifact) => {
    e.stopPropagation()
    const startX = e.clientX
    const origW = artifact.w ?? 320
    const move = (ev: PointerEvent) => {
      const nw = Math.max(240, Math.min(560, origW + (ev.clientX - startX)))
      updateArtifact(artifact.id, { w: nw })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onSlotPointerDown = (e: React.PointerEvent, artifact: Artifact) => {
    const target = e.target as HTMLElement
    if (target.closest('.card-resize')) {
      e.preventDefault()
      startResize(e, artifact)
      return
    }
    if (target.closest('.intent-card-close')) return
    if (!target.closest('.intent-card-header')) return
    e.preventDefault()
    startDrag(e, artifact)
  }

  return (
    <div className="intent-cards-container" aria-live="polite">
      {artifacts.map((artifact) => (
        <div
          className={`card-slot slot-${artifact.slot ?? 0}`}
          key={artifact.id}
          style={{
            transform: artifact.pos ? `translate(${artifact.pos.x}px, ${artifact.pos.y}px)` : undefined,
            // @ts-expect-error CSS 自定义属性
            '--card-w': artifact.w ? `${artifact.w}px` : undefined,
          }}
          onPointerDown={(e) => onSlotPointerDown(e, artifact)}
        >
          {renderArtifact(artifact, transcript)}
          <div className="card-resize" title="拖拽缩放窗口" aria-hidden="true">
            <span className="material-symbols-outlined">drag_handle</span>
          </div>
        </div>
      ))}
    </div>
  )
}
