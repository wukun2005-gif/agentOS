import { useEffect } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import { ORB_STATE_LABELS, type OrbState } from '../orb/OrbState'
import './StateControls.css'

/**
 * F4: 状态切换控制
 *
 * - 5 个按钮切换状态
 * - 光球点击：Idle→Listening，再次点击取消
 * - 键盘快捷键：空格切换 Listening/Idle，ESC 回 Idle
 * - 状态标签：光球下方显示当前状态名
 */

const STATE_DESCRIPTIONS: Record<OrbState, string> = {
  idle: '待命 — 青绿色缓慢呼吸',
  listening: '聆听中 — 快速脉动接收',
  understanding: '理解中 — 向内收缩',
  thinking: '思考中 — 旋转深度处理',
  responding: '回应中 — 暖金色轻摆',
}

const ALL_STATES: OrbState[] = ['idle', 'listening', 'understanding', 'thinking', 'responding']

export function StateControls() {
  const orbState = useOrbStore((s) => s.orbState)
  const setOrbState = useOrbStore((s) => s.setOrbState)
  const setIntentFlowActive = useOrbStore((s) => s.setIntentFlowActive)

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
      {/* 状态标签 — 光球下方 */}
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

      {/* 按钮组 — 底部 */}
      <div className="state-controls">
        {ALL_STATES.map((state) => (
          <button
            key={state}
            className={`state-btn ${orbState === state ? 'active' : ''}`}
            onClick={() => handleStateChange(state)}
            aria-pressed={orbState === state}
          >
            {ORB_STATE_LABELS[state]}
          </button>
        ))}
      </div>
    </>
  )
}
