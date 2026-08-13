import { useEffect, useRef } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import { ORB_STATE_LABELS, type OrbState } from './OrbState'
import './Orb.css'

/**
 * F1+F2: Nexus OS Liquid Light Core (PRD v0.2 — 8 态状态机)
 *
 * 视觉：有机形状液态光核 + 内核高光 + 双层光晕环 + 环境光晕 + 粒子系统
 * 逻辑：Zustand store 驱动 8 态切换 + 自动超时回 Idle
 */
const AUTO_TIMEOUTS: Partial<Record<OrbState, number>> = {
  listening: 8000,
  captured: 1500,
  executing: 4000,
  clarifying: 10000,
  responding: 3000,
  error: 3000,
}

const PARTICLE_COUNT = 36

interface Particle {
  size: number
  x: number
  y: number
  duration: number
  delay: number
  tx: number
  ty: number
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * -30,
    tx: Math.random() * 200 - 100,
    ty: Math.random() * 200 - 100,
  }))
}

export function Orb() {
  const orbState = useOrbStore((s) => s.orbState)
  const setOrbState = useOrbStore((s) => s.setOrbState)
  const intentFlowActive = useOrbStore((s) => s.intentFlowActive)

  const particlesRef = useRef<Particle[]>(generateParticles())

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
    <div className="orb-container" role="img" aria-label={`Nexus Core — ${ORB_STATE_LABELS[orbState]}`}>
      {/* Ambient glow — 大范围模糊光晕 */}
      <div className="orb-ambient" />

      {/* Halo rings — 双层光晕环 */}
      <div className="orb-halo-1" />
      <div className="orb-halo-2" />

      {/* The Core — 液态光核 */}
      <div className={`orb ${orbState}`} />

      {/* Inner core highlight — 内核高光 */}
      <div className="orb-inner" />

      {/* Particles — 浮动粒子系统 */}
      {particlesRef.current.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            ['--tx' as string]: `${p.tx}px`,
            ['--ty' as string]: `${p.ty}px`,
          }}
        />
      ))}

      {/* Idle 态底部提示 */}
      {orbState === 'idle' && (
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-body)',
            fontSize: '20px',
            color: 'var(--primary)',
            opacity: 0.8,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(0, 219, 233, 0.5)',
            whiteSpace: 'nowrap',
            animation: 'ambient-pulse 3s ease-in-out infinite alternate',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          Ready for your intent
        </div>
      )}
    </div>
  )
}
