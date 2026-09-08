import { useState } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import type { Artifact } from '../orb/OrbState'
import { SAVED_MINUTES } from '../../agents/types'
import { CardButton, CardFrame } from './CardFrame'

/**
 * 会议纪要卡片（PRD v1.0 §4.2.3 会议全链路自动化）
 *
 * 会后分支：核心决策 / 待办事项（责任人 + 截止）/ 相关文档
 * 三个落地动作：同步 Jira、发送邮件、更新项目文档
 */
export function MeetingCard({ artifact }: { artifact: Artifact }) {
  const updateArtifact = useOrbStore((s) => s.updateArtifact)
  const pushNotification = useOrbStore((s) => s.pushNotification)
  const addTimeSaved = useOrbStore((s) => s.addTimeSaved)
  const dismissArtifact = useOrbStore((s) => s.dismissArtifact)

  const [done, setDone] = useState<Record<string, boolean>>({})

  const data = artifact.data
  if (!data || data.type !== 'meeting') return null
  const { minutes, synced, mailed, documented } = data

  const patch = (p: Partial<typeof data>) => updateArtifact(artifact.id, { data: { ...data, ...p } })

  const handleSync = () => {
    patch({ synced: true })
    addTimeSaved(SAVED_MINUTES.meetingSync)
    pushNotification({
      icon: 'task_alt',
      title: '已同步到 Jira',
      detail: `3 个任务已创建 · 节省 ${SAVED_MINUTES.meetingSync} 分钟`,
      tone: 'success',
    })
  }

  const handleMail = () => {
    patch({ mailed: true })
    pushNotification({
      icon: 'send',
      title: '纪要已发送给 4 位参会人',
      detail: minutes.title,
      tone: 'success',
    })
  }

  const handleDoc = () => {
    patch({ documented: true })
    pushNotification({
      icon: 'description',
      title: '项目文档已更新',
      detail: '决策与行动项已写入项目计划书',
      tone: 'success',
    })
  }

  return (
    <CardFrame
      icon="groups"
      title="会议纪要"
      badge="MEETING"
      tone={synced ? 'success' : 'primary'}
      onClose={() => dismissArtifact(artifact.id)}
      actions={
        <>
          <CardButton
            variant={synced ? 'done' : 'ghost'}
            icon={synced ? 'check_circle' : 'task_alt'}
            onClick={handleSync}
            disabled={synced}
          >
            {synced ? '已同步 Jira' : '同步到 Jira'}
          </CardButton>
          <CardButton
            variant={mailed ? 'done' : 'ghost'}
            icon={mailed ? 'check_circle' : 'send'}
            onClick={handleMail}
            disabled={mailed}
          >
            {mailed ? '已发送' : '发送参会人'}
          </CardButton>
          <CardButton
            variant={documented ? 'done' : 'ghost'}
            icon={documented ? 'check_circle' : 'description'}
            onClick={handleDoc}
            disabled={documented}
          >
            {documented ? '已更新' : '更新文档'}
          </CardButton>
        </>
      }
    >
      <div className="meeting-head">
        <div className="meeting-title">{minutes.title}</div>
        <div className="intent-card-desc">
          {minutes.date} {minutes.time} · {minutes.duration} · {minutes.attendees.length} 人
        </div>
      </div>

      <div className="meeting-section">
        <div className="meeting-section-label">核心决策</div>
        {minutes.decisions.map((d, i) => (
          <div className="meeting-decision" key={i}>
            <span className="decision-index">{i + 1}</span>
            <span>{d}</span>
          </div>
        ))}
      </div>

      <div className="meeting-section">
        <div className="meeting-section-label">行动项</div>
        {minutes.actionItems.map((item) => (
          <button
            key={item.id}
            className={`meeting-action ${done[item.id] ? 'checked' : ''}`}
            onClick={() => setDone((s) => ({ ...s, [item.id]: !s[item.id] }))}
            type="button"
          >
            <span className="material-symbols-outlined">
              {done[item.id] ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span className="meeting-action-text">{item.text}</span>
            <span className="meeting-action-owner">{item.owner}</span>
            <span className="meeting-action-due">{item.due}</span>
          </button>
        ))}
      </div>

      <div className="meeting-docs">
        {minutes.docs.map((doc) => (
          <span className="doc-chip" key={doc.id}>
            <span className="material-symbols-outlined">description</span>
            {doc.name}
          </span>
        ))}
      </div>
    </CardFrame>
  )
}
