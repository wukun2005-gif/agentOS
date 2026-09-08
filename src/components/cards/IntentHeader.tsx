import { useOrbStore } from '../../store/useOrbStore'
import { INTENT_LABELS } from '../orb/OrbState'
import './IntentHeader.css'

/**
 * 顶部意图引言 — 对照设计稿 nexus_os_2 `"Organize my trip to Tokyo."`
 *
 * PRD v1.0 增加"听+懂协议"的第二步：AI 复述（acknowledgment），
 * 让用户在执行前就能修正系统的理解。
 */
export function IntentHeader() {
  const orbState = useOrbStore((s) => s.orbState)
  const transcript = useOrbStore((s) => s.transcript)
  const scenario = useOrbStore((s) => s.scenario)
  const ack = useOrbStore((s) => s.acknowledgment)
  const hasArtifacts = useOrbStore((s) => s.artifacts.length > 0)

  // 产物仍在场时保留引言，避免结果还在、上下文已消失
  if ((orbState === 'idle' && !hasArtifacts) || !transcript) return null

  return (
    <div className="intent-header">
      <span className="intent-header-label">
        {scenario ? INTENT_LABELS[scenario] : 'Intent Captured'}
      </span>
      <h1 className="intent-header-text">“{transcript}”</h1>
      {ack && <p className="intent-header-ack">{ack}</p>}
    </div>
  )
}
