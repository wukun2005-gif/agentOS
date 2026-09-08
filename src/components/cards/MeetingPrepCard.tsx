import { useState } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import type { Artifact } from '../orb/OrbState'
import { CardButton, CardFrame } from './CardFrame'

/**
 * 会议会前准备卡片（PRD v1.0 §4.2.3 会前准备子场景）
 *
 * 议程预览 / 待读材料（含预计耗时）/ 参会人需对齐项 / 遗留议题 / 风险预警。
 * 「标记已准备」后给出已读确认并收起。
 */
export function MeetingPrepCard({ artifact }: { artifact: Artifact }) {
  const updateArtifact = useOrbStore((s) => s.updateArtifact)
  const pushNotification = useOrbStore((s) => s.pushNotification)
  const dismissArtifact = useOrbStore((s) => s.dismissArtifact)
  const [ready, setReady] = useState(false)

  const data = artifact.data
  if (!data || data.type !== 'prep') return null
  const { prep } = data

  const totalMins = prep.docsToRead.reduce((sum, d) => sum + d.mins, 0)

  const patch = (p: Partial<typeof data>) => updateArtifact(artifact.id, { data: { ...data, ...p } })

  const handleReady = () => {
    setReady(true)
    patch({ ready: true } as Partial<typeof data>)
    pushNotification({
      icon: 'task_alt',
      title: '已标记会议准备完成',
      detail: `${prep.title} · 阅读 ${totalMins} 分钟`,
      tone: 'success',
    })
    setTimeout(() => dismissArtifact(artifact.id), 600)
  }

  return (
    <CardFrame
      icon="event_available"
      title="会议准备"
      badge="PREP"
      tone="primary"
      onClose={() => dismissArtifact(artifact.id)}
      actions={
        <>
          <CardButton variant={ready ? 'done' : 'primary'} onClick={handleReady} disabled={ready}>
            {ready ? '已准备' : '标记已准备'}
          </CardButton>
          <CardButton onClick={() => dismissArtifact(artifact.id)}>稍后</CardButton>
        </>
      }
    >
      <div className="meeting-head">
        <div className="meeting-title">{prep.title}</div>
        <div className="intent-card-desc">
          {prep.time} · {prep.duration} · {prep.attendees.length} 人
        </div>
      </div>

      <div className="meeting-section">
        <div className="meeting-section-label">议程预览</div>
        {prep.agenda.map((a, i) => (
          <div className="meeting-decision" key={i}>
            <span className="decision-index">{i + 1}</span>
            <span>{a}</span>
          </div>
        ))}
      </div>

      <div className="meeting-section">
        <div className="meeting-section-label">待读材料 · 约 {totalMins} 分钟</div>
        <div className="meeting-docs">
          {prep.docsToRead.map((doc) => (
            <span className="doc-chip" key={doc.id}>
              <span className="material-symbols-outlined">description</span>
              {doc.name}
              <span className="prep-doc-mins">{doc.mins}m</span>
            </span>
          ))}
        </div>
      </div>

      <div className="meeting-section">
        <div className="meeting-section-label">参会人 · 需你提前对齐</div>
        {prep.attendees.map((person) => (
          <div className="prep-attendee" key={person.name}>
            <span className="prep-attendee-name">{person.name}</span>
            <span className="prep-attendee-prep">{person.prep}</span>
          </div>
        ))}
      </div>

      {prep.openLoops.length > 0 && (
        <div className="meeting-section">
          <div className="meeting-section-label">遗留议题</div>
          {prep.openLoops.map((loop, i) => (
            <div className="prep-loop" key={i}>
              <span className="material-symbols-outlined">sync</span>
              {loop}
            </div>
          ))}
        </div>
      )}

      {prep.risks.length > 0 && (
        <div className="meeting-section">
          <div className="meeting-section-label warn">风险预警</div>
          {prep.risks.map((risk, i) => (
            <div className="prep-risk" key={i}>
              <span className="material-symbols-outlined">warning</span>
              {risk}
            </div>
          ))}
        </div>
      )}
    </CardFrame>
  )
}
