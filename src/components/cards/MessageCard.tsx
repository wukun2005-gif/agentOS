import { useOrbStore } from '../../store/useOrbStore'
import type { Artifact } from '../orb/OrbState'
import { CardButton, CardFrame } from './CardFrame'

/**
 * 沟通摘要卡片（PRD v1.0 §4.2.4 工作沟通增强）
 *
 * 频道摘要：聚合 24h 消息、提炼关键讨论、识别 @ 提及与行动项
 */
export function MessageCard({ artifact }: { artifact: Artifact }) {
  const updateArtifact = useOrbStore((s) => s.updateArtifact)
  const pushNotification = useOrbStore((s) => s.pushNotification)
  const addTimeSaved = useOrbStore((s) => s.addTimeSaved)
  const dismissArtifact = useOrbStore((s) => s.dismissArtifact)

  const data = artifact.data
  if (!data || data.type !== 'message') return null
  const { digest, extracted } = data

  const handleExtract = () => {
    updateArtifact(artifact.id, { data: { ...data, extracted: true } })
    addTimeSaved(5)
    pushNotification({
      icon: 'task_alt',
      title: `${digest.extractedTasks.length} 项待办已提取`,
      detail: `${digest.channel} → 已同步到任务列表`,
      tone: 'success',
    })
  }

  return (
    <CardFrame
      icon="forum"
      title="沟通摘要"
      badge="CHAT"
      tone="primary"
      onClose={() => dismissArtifact(artifact.id)}
      actions={
        <CardButton
          variant={extracted ? 'done' : 'primary'}
          icon={extracted ? 'check_circle' : 'task_alt'}
          onClick={handleExtract}
          disabled={extracted}
        >
          {extracted ? '待办已提取' : '提取为待办'}
        </CardButton>
      }
    >
      <div className="msg-head">
        <span className="msg-channel">{digest.channel}</span>
        <span className="intent-card-desc">{digest.window}</span>
      </div>

      <div className="msg-stats">
        <div className="msg-stat">
          <span className="msg-stat-value">{digest.unread}</span>
          <span className="msg-stat-label">未读消息</span>
        </div>
        <div className="msg-stat warn">
          <span className="msg-stat-value">{digest.mentions}</span>
          <span className="msg-stat-label">@ 我</span>
        </div>
        <div className="msg-stat">
          <span className="msg-stat-value">{digest.extractedTasks.length}</span>
          <span className="msg-stat-label">待办</span>
        </div>
      </div>

      <div className="msg-list">
        {digest.highlights.map((h) => (
          <div className={`msg-item ${h.mention ? 'mention' : ''}`} key={h.id}>
            <div className="msg-item-head">
              <span className="msg-item-from">{h.from}</span>
              <span className="msg-item-time">{h.time}</span>
            </div>
            <div className="msg-item-text">{h.text}</div>
          </div>
        ))}
      </div>

      <div className="meeting-section-label" style={{ marginTop: '12px' }}>
        从对话中提取
      </div>
      {digest.extractedTasks.map((t, i) => (
        <div className="msg-task" key={i}>
          <span className="material-symbols-outlined">check</span>
          {t}
        </div>
      ))}
    </CardFrame>
  )
}
