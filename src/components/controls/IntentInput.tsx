import { useState, useRef, type KeyboardEvent } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import type { OrbState } from '../orb/OrbState'
import './IntentInput.css'

/**
 * F9: 文字输入意图
 *
 * - 输入框：底部居中，深色背景 + 青色边框聚焦
 * - 回车提交：触发 Listening → Understanding → Thinking → Responding → Idle
 * - 3 个快捷按钮：天气 / 音乐 / 提醒
 * - 转写显示区：光球下方显示输入文字
 *
 * 状态流转时序：
 *   Listening(0.5s) → Understanding(0.4s) → Thinking(1.5s) → Responding(2s) → Idle
 */

const QUICK_PROMPTS = [
  { label: '明天北京天气', text: '明天北京天气' },
  { label: '放一首适合下雨天的歌', text: '放一首适合下雨天的歌' },
  { label: '15分钟后提醒我开会', text: '15分钟后提醒我开会' },
]

/** 意图流程时序：每个状态的持续时长（毫秒） */
const FLOW_TIMING: Array<{ state: OrbState; duration: number }> = [
  { state: 'listening', duration: 500 },
  { state: 'understanding', duration: 400 },
  { state: 'thinking', duration: 1500 },
  { state: 'responding', duration: 2000 },
]

export function IntentInput() {
  const [input, setInput] = useState('')
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const orbState = useOrbStore((s) => s.orbState)
  const setOrbState = useOrbStore((s) => s.setOrbState)
  const transcript = useOrbStore((s) => s.transcript)
  const setTranscript = useOrbStore((s) => s.setTranscript)
  const setIntentFlowActive = useOrbStore((s) => s.setIntentFlowActive)

  /** 清除所有定时器 */
  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  /**
   * 执行意图流程
   *
   * 时序：
   *   0ms      → listening（持续 500ms）
   *   500ms    → understanding（持续 400ms）
   *   900ms    → thinking（持续 1500ms）
   *   2400ms   → responding（持续 2000ms）
   *   4400ms   → idle
   */
  const runIntentFlow = (text: string) => {
    clearAllTimers()
    setIntentFlowActive(true)
    setTranscript(text)
    setOrbState('listening')

    let elapsed = 0
    for (let i = 0; i < FLOW_TIMING.length; i++) {
      elapsed += FLOW_TIMING[i].duration
      const isLast = i === FLOW_TIMING.length - 1

      const timer = setTimeout(() => {
        if (isLast) {
          setIntentFlowActive(false)
          setOrbState('idle')
        } else {
          setOrbState(FLOW_TIMING[i + 1].state)
        }
      }, elapsed)
      timersRef.current.push(timer)
    }
  }

  /** 回车提交 */
  const handleSubmit = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    runIntentFlow(text)
  }

  /** 快捷按钮 */
  const handleQuickPrompt = (text: string) => {
    runIntentFlow(text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isFlowing = orbState !== 'idle'

  return (
    <>
      {/* 转写显示区 — 光球下方 */}
      {transcript && (
        <div className="transcript-display">
          <span className="transcript-text">{transcript}</span>
        </div>
      )}

      {/* 快捷按钮 */}
      <div className="quick-prompts">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            className="quick-prompt-btn"
            onClick={() => handleQuickPrompt(prompt.text)}
            disabled={isFlowing}
          >
            {prompt.label}
          </button>
        ))}
      </div>

      {/* 输入框 */}
      <div className="intent-input-wrapper">
        <input
          type="text"
          className="intent-input"
          placeholder="输入你的意图…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isFlowing}
          aria-label="意图输入框"
        />
        <button
          className="intent-submit"
          onClick={handleSubmit}
          disabled={isFlowing || !input.trim()}
          aria-label="提交意图"
        >
          →
        </button>
      </div>
    </>
  )
}
