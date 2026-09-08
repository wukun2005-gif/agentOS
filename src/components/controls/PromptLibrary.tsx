import { useOrbStore } from '../../store/useOrbStore'
import { runIntentFlow } from '../../logic/intentFlow'
import { PROMPT_LIBRARY } from '../../mock/prompts'
import './PromptLibrary.css'

/**
 * 提示词库（PRD v1.0 §4 全场景覆盖）
 *
 * 按意图场景分组的快捷入口：空态（无产物 + 无流转）时展示，
 * 用户点击任一 prompt 即派发对应意图，无需手敲 query。
 */
export function PromptLibrary() {
  const orbState = useOrbStore((s) => s.orbState)
  const artifacts = useOrbStore((s) => s.artifacts)

  const isFlowing =
    orbState === 'listening' ||
    orbState === 'captured' ||
    orbState === 'understanding' ||
    orbState === 'executing' ||
    orbState === 'responding'

  // 仅在空态展示，避免与产物卡片、流转态抢视线
  if (isFlowing || artifacts.length > 0) return null

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
              {group.title}
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
