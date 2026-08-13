import { useOrbStore } from '../../store/useOrbStore'
import './IntentHeader.css'

/**
 * 顶部意图引言 — 对照设计稿 nexus_os_2 `"Organize my trip to Tokyo."`
 *
 * 意图流激活时（非 idle 态），在主区域顶部以 display-core 大字
 * 显示用户输入的意图，替代原先光球下方的小字转写。
 */
export function IntentHeader() {
  const orbState = useOrbStore((s) => s.orbState)
  const transcript = useOrbStore((s) => s.transcript)

  if (orbState === 'idle' || !transcript) return null

  return (
    <div className="intent-header">
      <span className="intent-header-label">Intent Captured</span>
      <h1 className="intent-header-text">“{transcript}”</h1>
    </div>
  )
}
