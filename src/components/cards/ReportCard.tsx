import type { Artifact } from '../orb/OrbState'
import { SAVED_MINUTES } from '../../agents/types'
import { reportRecipients } from '../../agents/ReportAgent'
import { CardButton, CardFrame } from './CardFrame'
import { useOrbStore } from '../../store/useOrbStore'

/**
 * 智能周报卡片（PRD v1.0 §4.2.7）
 *
 * 自动汇总本周成果 / 风险 / 下周计划，确认后一键发送给主管与项目组。
 * 发送属于 external-action，必须二次确认（与邮件回复同一约束）。
 */
export function ReportCard({ artifact }: { artifact: Artifact }) {
  const updateArtifact = useOrbStore((s) => s.updateArtifact)
  const dismissArtifact = useOrbStore((s) => s.dismissArtifact)
  const pushNotification = useOrbStore((s) => s.pushNotification)

  const data = artifact.data
  if (!data || data.type !== 'report') return null
  const { report, sent } = data

  const recipients = reportRecipients().join('、')

  const handleSend = () => {
    updateArtifact(artifact.id, { data: { ...data, sent: true } })
    pushNotification({
      icon: 'send',
      title: '周报已发送',
      detail: `收件人：${recipients}`,
      tone: 'success',
    })
  }

  return (
    <CardFrame
      icon="summarize"
      title="智能周报"
      badge="REPORT"
      tone={sent ? 'success' : 'primary'}
      wide
      onClose={() => dismissArtifact(artifact.id)}
      actions={
        sent ? (
          <CardButton variant="done" icon="check_circle" disabled>
            已发送
          </CardButton>
        ) : (
          <CardButton variant="primary" icon="send" onClick={handleSend}>
            确认发送
          </CardButton>
        )
      }
    >
      <div className="report-range">{report.range}</div>
      <div className="report-headline">{report.headline}</div>

      <div className="report-stats">
        {report.stats.map((s) => (
          <div className="report-stat" key={s.label}>
            <span className="report-stat-value">
              {s.value}
              {s.delta && <em className="report-stat-delta">{s.delta}</em>}
            </span>
            <span className="report-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="report-section">
        <div className="report-section-label">本周成果</div>
        {report.done.map((d, i) => (
          <div className="report-item" key={i}>
            <span className="material-symbols-outlined report-item-dot">check_circle</span>
            {d}
          </div>
        ))}
      </div>

      <div className="report-section">
        <div className="report-section-label">风险与阻塞</div>
        {report.risks.map((r, i) => (
          <div className="report-item warn" key={i}>
            <span className="material-symbols-outlined report-item-dot">warning</span>
            {r}
          </div>
        ))}
      </div>

      <div className="report-section">
        <div className="report-section-label">下周计划</div>
        {report.nextWeek.map((n, i) => (
          <div className="report-item" key={i}>
            <span className="material-symbols-outlined report-item-dot">arrow_forward</span>
            {n}
          </div>
        ))}
      </div>

      <div className="report-foot">
        收件人：{recipients} · 预计节省 {SAVED_MINUTES.weeklyReport} 分钟
      </div>
    </CardFrame>
  )
}
