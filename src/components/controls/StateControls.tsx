import { useEffect, useState } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import { ORB_STATE_LABELS, type OrbState } from '../orb/OrbState'
import './StateControls.css'

/**
 * F4: 状态切换控制（PRD v0.2 — 8 态状态机）
 *
 * - 光球点击层：Idle→Listening，再次点击取消
 * - 键盘快捷键：空格切换 Listening/Idle，ESC 回 Idle
 * - 状态标签：Core 下方显示当前状态名
 * - 调试浮标（右下角）：8 态切换按钮折叠于此 — demo 调试用，避免占用主区域
 */

const STATE_DESCRIPTIONS: Record<OrbState, string> = {
  idle: '待命 — 电光青有机呼吸',
  listening: '聆听中 — 快速脉动接收',
  captured: '已收到 — 外环向内收拢',
  understanding: '理解中 — 青→紫渐变内聚',
  executing: '执行中 — 紫色内核旋转',
  responding: '回应中 — 纯白轻摆',
  clarifying: '澄清中 — 温和紫色静止',
  error: '错误 — 红色短脉冲 + 断环',
}

const ALL_STATES: OrbState[] = [
  'idle',
  'listening',
  'captured',
  'understanding',
  'executing',
  'responding',
  'clarifying',
  'error',
]

export function StateControls() {
  const orbState = useOrbStore((s) => s.orbState)
  const setOrbState = useOrbStore((s) => s.setOrbState)
  const setIntentFlowActive = useOrbStore((s) => s.setIntentFlowActive)
  const [debugOpen, setDebugOpen] = useState(false)

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果焦点在输入框中，不拦截
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      if (e.code === 'Space') {
        e.preventDefault()
        setIntentFlowActive(false)
        setOrbState(orbState === 'listening' ? 'idle' : 'listening')
      } else if (e.code === 'Escape') {
        e.preventDefault()
        setIntentFlowActive(false)
        setOrbState('idle')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [orbState, setOrbState, setIntentFlowActive])

  // 光球点击处理
  const handleOrbClick = () => {
    setIntentFlowActive(false)
    if (orbState === 'idle') {
      setOrbState('listening')
    } else if (orbState === 'listening') {
      setOrbState('idle')
    }
  }

  // 按钮切换
  const handleStateChange = (state: OrbState) => {
    setIntentFlowActive(false)
    setOrbState(state)
  }

  return (
    <>
      {/* 状态标签 — Core 下方 */}
      <div className="state-label">
        <span className="state-label-name">{ORB_STATE_LABELS[orbState]}</span>
        <span className="state-label-desc">{STATE_DESCRIPTIONS[orbState]}</span>
      </div>

      {/* 光球点击层 */}
      <div
        className="orb-click-layer"
        onClick={handleOrbClick}
        role="button"
        tabIndex={-1}
        aria-label="点击切换聆听状态"
      />

      {/* 调试浮标 — 右下角，8 态切换（demo 调试，不占主区域） */}
      <div className={`debug-dock ${debugOpen ? 'open' : ''}`}>
        {debugOpen && (
          <div className="debug-states">
            <span className="debug-states-title">STATES</span>
            {ALL_STATES.map((state) => (
              <button
                key={state}
                className={`state-btn ${orbState === state ? 'active' : ''} ${
                  state === 'error' ? 'error-btn' : ''
                }`}
                onClick={() => handleStateChange(state)}
                aria-pressed={orbState === state}
              >
                {ORB_STATE_LABELS[state]}
              </button>
            ))}
          </div>
        )}
        <button
          className="debug-toggle"
          onClick={() => setDebugOpen((v) => !v)}
          aria-label="切换调试状态面板"
          aria-expanded={debugOpen}
        >
          <span className="material-symbols-outlined">{debugOpen ? 'close' : 'tune'}</span>
          {!debugOpen && <span className="debug-toggle-label">STATES</span>}
        </button>
      </div>
    </>
  )
}
