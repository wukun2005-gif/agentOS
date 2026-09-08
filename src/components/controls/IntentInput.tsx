import { useState, type KeyboardEvent } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import { runIntentFlow } from '../../logic/intentFlow'
import './IntentInput.css'

/**
 * F9: 文字输入意图（PRD v1.0 — 办公场景）
 *
 * - 底部命令栏：横跨主区域底部居中，青色边框聚焦
 * - 回车提交 → 由 intentFlow 统一编排 8 态状态流转与产物生成
 * - 场景化快捷提示见 PromptLibrary（空态展示，覆盖 PRD §4 全场景）
 */

export function IntentInput() {
  const [input, setInput] = useState('')
  const orbState = useOrbStore((s) => s.orbState)

  const handleSubmit = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    runIntentFlow(text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isFlowing =
    orbState === 'listening' ||
    orbState === 'captured' ||
    orbState === 'understanding' ||
    orbState === 'executing' ||
    orbState === 'responding'

  return (
    <div className="intent-command-bar">
      {/* 命令栏输入 */}
      <div className="intent-input-wrapper">
        <span className="material-symbols-outlined intent-input-icon">auto_awesome</span>
        <input
          type="text"
          className="intent-input"
          placeholder="说出你要的结果，例如「今天有什么重要的」…"
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
          type="button"
        >
          →
        </button>
      </div>
    </div>
  )
}

