import { useEffect } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import { ORB_STATE_LABELS, type OrbState } from './OrbState'
import './Orb.css'

/**
 * F1+F2: 能量光球组件（PRD v0.2 — 8 态状态机）
 *
 * F1: CSS radial-gradient + box-shadow 多层光叠加 + 双层光晕环
 * F2: Zustand store 驱动 8 态切换 + 自动超时回 Idle
 *
 * 自动超时（仅手动切换时生效，意图流程 F9 时禁用）：
 * - Listening 8s 超时
 * - Captured 1.5s 后回 Idle（手动演示用）
 * - Executing 4s 超时
 * - Clarifying 10s 超时
 * - Responding 3s 后回 Idle
 * - Error 3s 后回 Idle
 */
const AUTO_TIMEOUTS: Partial<Record<OrbState, number>> = {
  listening: 8000,
  captured: 1500,
  executing: 4000,
  clarifying: 10000,
  responding: 3000,
  error: 3000,
}

export function Orb() {
  const orbState = useOrbStore((s) => s.orbState)
  const setOrbState = useOrbStore((s) => s.setOrbState)
  const intentFlowActive = useOrbStore((s) => s.intentFlowActive)

  useEffect(() => {
    if (intentFlowActive) return

    const timeout = AUTO_TIMEOUTS[orbState]
    if (!timeout) return

    const timer = setTimeout(() => {
      setOrbState('idle')
    }, timeout)

    return () => clearTimeout(timer)
  }, [orbState, setOrbState, intentFlowActive])

  return (
    <div
      className={`orb ${orbState}`}
      role="img"
      aria-label={`AI 能量光球 — ${ORB_STATE_LABELS[orbState]}`}
    />
  )
}
