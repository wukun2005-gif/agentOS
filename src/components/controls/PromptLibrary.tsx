import { useOrbStore } from '../../store/useOrbStore'
import { runIntentFlow } from '../../logic/intentFlow'
import { PROMPT_LIBRARY } from '../../mock/prompts'
import './PromptLibrary.css'

/**
 * 提示词库（PRD v1.0 §4 全场景覆盖）
 *
 * 按意图场景分组的快捷入口：「桌面空态」时展示——
 * 没有窗口、没有产物、没有流转。用户点击任一 prompt 即派发对应意图。
 */
export function PromptLibrary() {
  const orbState = useOrbStore((s) => s.orbState)
  const artifacts = useOrbStore((s) => s.artifacts)
  const activeApp = useOrbStore((s) => s.activeApp)

  const isFlowing =
    orbState === 'listening' ||
    orbState === 'captured' ||
    orbState === 'understanding' ||
    orbState === 'executing' ||
    orbState === 'responding'

  // 仅在「桌面空态」展示。窗口打开时必须隐藏——窗口本身已提供上下文，
  // 与提示词库并存会产生严重视觉重叠（设置项 vs prompt chips 互相挡字）。
  if (isFlowing || artifacts.length > 0 || activeApp !== null) return null

  return (
    <div className="prompt-library" aria-label="场景提示词库">
      <div className="prompt-library-hint">
        <span className="material-symbols-outlined">auto_awesome</span>
        直接点选场景，或下方输入你的意图
      </div>
      <div className="prompt-groups">
        {PROMPT_LIBRARY.map((group) => (
          <div className="prompt-group" key={group.kind}>
            <div className="prompt-group-head">
              <span className="material-symbols-outlined prompt-group-icon">{group.icon}</span>
              <span className="prompt-group-title">{group.title}</span>
              <span className="prompt-group-friction">{group.friction}</span>
            </div>
            <div className="prompt-chips">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className="prompt-chip"
                  type="button"
                  onClick={() => runIntentFlow(item.text)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
