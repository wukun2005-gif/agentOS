import { useState } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import { PENDING_REPLY_COUNT, UNREAD_MAIL_COUNT } from '../../mock/emails'
import { TODAY_MEETING_COUNT } from '../../mock/meetings'
import { MENTION_COUNT } from '../../mock/messages'
import { SAVED_MINUTES } from '../../agents/types'
import { runIntentFlow } from '../../logic/intentFlow'
import './MorningBrief.css'

/**
 * 晨间简报条（PRD v1.0 §4.2.1）
 *
 * Idle 态：以一行环境式提示呈现今日待办密度，替代说明文档引导首次使用者
 * （"光球本身就是入口"，提示即给出可直接说出口的那句话）。
 * brief 场景：切换为价值量化——60 分钟晨间处理 → 5 分钟掌握全天。
 */
export function MorningBrief() {
  const scenario = useOrbStore((s) => s.scenario)
  const orbState = useOrbStore((s) => s.orbState)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  if (scenario === 'brief' && orbState !== 'idle') {
    return (
      <div className="morning-brief success">
        <span className="material-symbols-outlined">wb_sunny</span>
        <span className="morning-brief-text">
          晨间简报已生成 · 5 分钟掌握全天 · 节省 <strong>{SAVED_MINUTES.brief} 分钟</strong>
        </span>
        <button className="morning-brief-close" onClick={() => setDismissed(true)} aria-label="关闭">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    )
  }

  if (orbState !== 'idle') return null

  return (
    <div className="morning-brief">
      <span className="material-symbols-outlined">tips_and_updates</span>
      <span className="morning-brief-text">
        今日 {UNREAD_MAIL_COUNT} 封待处理 · {MENTION_COUNT} 条 @ 你 · {TODAY_MEETING_COUNT} 个会议 ·{' '}
        {PENDING_REPLY_COUNT} 封待回复
      </span>
      <button className="morning-brief-cta" onClick={() => runIntentFlow('今天有什么重要的')}>
        今天有什么重要的？
      </button>
      <button className="morning-brief-close" onClick={() => setDismissed(true)} aria-label="关闭">
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  )
}
