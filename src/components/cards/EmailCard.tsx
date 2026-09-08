import { useState } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import type { Artifact } from '../orb/OrbState'
import { EMAIL_PRIORITY_LABELS, SAVED_MINUTES, type MockEmail } from '../../agents/types'
import { composeReply } from '../../agents/EmailAgent'
import { CardButton, CardFrame } from './CardFrame'

/**
 * 邮件卡片（PRD v1.0 §4.2.2 邮件 AI 助手）
 *
 * triage 态：发件人 + 主题 + 摘要 + 优先级标签 → 可一键生成回复
 * reply  态：展示 AI 草稿，可编辑，必须用户确认才"发送"（external-action 二次确认）
 */

const PRIORITY_TONE: Record<MockEmail['priority'], string> = {
  vip: 'warn',
  reply: 'primary',
  later: 'muted',
  auto: 'muted',
}

export function EmailCard({ artifact }: { artifact: Artifact }) {
  const updateArtifact = useOrbStore((s) => s.updateArtifact)
  const pushNotification = useOrbStore((s) => s.pushNotification)
  const addTimeSaved = useOrbStore((s) => s.addTimeSaved)
  const dismissArtifact = useOrbStore((s) => s.dismissArtifact)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => {
    const d = artifact.data
    return d && d.type === 'email' ? d.draft ?? composeReply(d.email) : ''
  })

  const data = artifact.data
  if (!data || data.type !== 'email') return null
  const { email, mode, sent } = data

  /** 生成回复草稿 */
  const handleDraft = () => {
    updateArtifact(artifact.id, {
      data: { type: 'email', email, mode: 'reply', draft },
      status: 'waiting',
    })
  }

  /** 确认发送 — external-action，必须由用户二次确认 */
  const handleSend = () => {
    updateArtifact(artifact.id, {
      data: { type: 'email', email, mode: 'reply', draft, sent: true },
      status: 'complete',
    })
    addTimeSaved(SAVED_MINUTES.emailReply)
    pushNotification({
      icon: 'send',
      title: `已发送给 ${email.from}（${email.role}）`,
      detail: `Re: ${email.subject} · 节省 ${SAVED_MINUTES.emailReply} 分钟`,
      tone: 'success',
    })
  }

  if (sent) {
    return (
      <CardFrame
        icon="send"
        title="邮件已发送"
        badge="SENT"
        tone="success"
        onClose={() => dismissArtifact(artifact.id)}
        actions={
          <CardButton variant="done" icon="check_circle" onClick={() => dismissArtifact(artifact.id)}>
            完成
          </CardButton>
        }
      >
        <div className="email-sent">
          <span className="material-symbols-outlined">check_circle</span>
          <div>
            <div className="email-sent-title">已发送给 {email.from} · {email.role}</div>
            <div className="intent-card-desc">Re: {email.subject}</div>
          </div>
        </div>
        <div className="saved-row">
          本次节省 <strong>{SAVED_MINUTES.emailReply} 分钟</strong>
        </div>
      </CardFrame>
    )
  }

  if (mode === 'reply') {
    return (
      <CardFrame
        icon="reply"
        title="回复草稿"
        badge="DRAFT"
        tone="primary"
        onClose={() => dismissArtifact(artifact.id)}
        actions={
          <>
            <CardButton onClick={() => setEditing((v) => !v)} icon="edit">
              {editing ? '预览' : '编辑'}
            </CardButton>
            <CardButton variant="primary" onClick={handleSend} icon="send">
              确认发送
            </CardButton>
          </>
        }
      >
        <div className="email-reply-head">
          <div className="email-from">
            <span className="email-avatar">{email.from.slice(0, 1)}</span>
            <div>
              <div className="email-from-name">
                收件人 · {email.from}（{email.role}）
              </div>
              <div className="intent-card-desc">Re: {email.subject}</div>
            </div>
          </div>
        </div>

        {editing ? (
          <textarea
            className="email-draft-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            aria-label="回复草稿"
          />
        ) : (
          <div className="email-draft">{draft}</div>
        )}

        <div className="saved-row muted">AI 基于邮件上下文生成 · 发送前可编辑</div>
      </CardFrame>
    )
  }

  return (
    <CardFrame
      icon="mail"
      title="邮件"
      badge="EMAIL"
      tone={email.priority === 'vip' ? 'warn' : 'primary'}
      onClose={() => dismissArtifact(artifact.id)}
      actions={
        <>
          <CardButton onClick={() => dismissArtifact(artifact.id)}>稍后处理</CardButton>
          {email.needsReply && (
            <CardButton variant="primary" onClick={handleDraft} icon="auto_awesome">
              生成回复
            </CardButton>
          )}
        </>
      }
    >
      <div className="email-head">
        <span className="email-avatar">{email.from.slice(0, 1)}</span>
        <div className="email-meta">
          <div className="email-from-name">
            {email.from}
            <span className="email-role">{email.role}</span>
          </div>
          <div className="email-subject">{email.subject}</div>
        </div>
        <span className="email-time">{email.time}</span>
      </div>

      <div className="email-preview">{email.preview}</div>

      <div className="email-tags">
        <span className={`email-tag ${PRIORITY_TONE[email.priority]}`}>
          {EMAIL_PRIORITY_LABELS[email.priority]}
        </span>
        {email.needsReply && <span className="email-tag primary">待回复</span>}
      </div>
    </CardFrame>
  )
}
