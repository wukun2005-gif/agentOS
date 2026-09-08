import { useOrbStore } from '../../store/useOrbStore'
import { runIntentFlow } from '../../logic/intentFlow'
import type { IntentKind } from '../orb/OrbState'
import './SidePanel.css'

/** 场景图标 + 中文名（复用 intentRouter 的标签） */
const KIND_META: Record<string, { icon: string; label: string }> = {
  brief: { icon: 'wb_sunny', label: '晨间简报' },
  email: { icon: 'mail', label: '邮件助手' },
  meeting: { icon: 'description', label: '会议纪要' },
  message: { icon: 'forum', label: '沟通摘要' },
  doc: { icon: 'search', label: '文档检索' },
  focus: { icon: 'shield', label: '深度工作' },
  report: { icon: 'summarize', label: '智能周报' },
  settings: { icon: 'tune', label: '系统设置' },
  unknown: { icon: 'auto_awesome', label: '未识别' },
}

function kindMeta(kind: IntentKind | 'unknown') {
  return KIND_META[kind] ?? KIND_META.unknown
}

/** 把 HH:MM 转成可排序的数字 */
function hmToNum(hm: string): number {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function SidePanel() {
  const view = useOrbStore((s) => s.view)
  const threads = useOrbStore((s) => s.threads)
  const notifications = useOrbStore((s) => s.notifications)
  const focusMode = useOrbStore((s) => s.focusMode)
  const setFocusMode = useOrbStore((s) => s.setFocusMode)
  const dndAll = useOrbStore((s) => s.dndAll)
  const setDndAll = useOrbStore((s) => s.setDndAll)
  const resetDemo = useOrbStore((s) => s.resetDemo)
  const setView = useOrbStore((s) => s.setView)

  if (view === 'threads') {
    if (threads.length === 0) {
      return (
        <div className="side-panel">
          <div className="side-panel-head">
            <span className="material-symbols-outlined">bubble_chart</span>
            <h2>会话线程</h2>
          </div>
          <div className="side-panel-empty">
            还没有运行过意图。在 Core 里说一句话或点一个提示词，就会在这里生成一条线程。
          </div>
        </div>
      )
    }

    return (
      <div className="side-panel">
        <div className="side-panel-head">
          <span className="material-symbols-outlined">bubble_chart</span>
          <h2>会话线程</h2>
          <span className="side-panel-count">{threads.length}</span>
        </div>
        <ul className="thread-list">
          {threads.map((t) => {
            const meta = kindMeta(t.kind)
            return (
              <li key={t.id}>
                <button
                  type="button"
                  className="thread-item"
                  onClick={() => {
                    setView('core')
                    runIntentFlow(t.query)
                  }}
                  title="回到主画布并重放此意图"
                >
                  <span className="material-symbols-outlined thread-icon">{meta.icon}</span>
                  <span className="thread-body">
                    <span className="thread-query">{t.query}</span>
                    <span className="thread-meta">
                      <span className={`thread-tag tag-${t.kind}`}>{meta.label}</span>
                      <span className="thread-time">{t.time}</span>
                      <span className="thread-count">{t.artifactCount} 产物</span>
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  if (view === 'history') {
    // 合并线程与通知，按时间倒序构成活动时间线
    const events = [
      ...threads.map((t) => ({
        key: t.id,
        time: t.time,
        icon: kindMeta(t.kind).icon,
        text: `运行意图：${t.query}`,
        sub: kindMeta(t.kind).label + (t.status === 'running' ? ' · 进行中' : ` · ${t.artifactCount} 产物`),
      })),
      ...notifications.map((n) => ({
        key: n.id,
        time: n.time,
        icon: n.icon,
        text: n.title,
        sub: n.detail ?? '',
      })),
    ].sort((a, b) => hmToNum(b.time) - hmToNum(a.time))

    return (
      <div className="side-panel">
        <div className="side-panel-head">
          <span className="material-symbols-outlined">history</span>
          <h2>活动历史</h2>
        </div>
        {events.length === 0 ? (
          <div className="side-panel-empty">暂无活动记录。</div>
        ) : (
          <ul className="history-list">
            {events.map((e) => (
              <li key={e.key} className="history-item">
                <span className="material-symbols-outlined history-icon">{e.icon}</span>
                <span className="history-body">
                  <span className="history-text">{e.text}</span>
                  {e.sub && <span className="history-sub">{e.sub}</span>}
                </span>
                <span className="history-time">{e.time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  // settings
  return (
    <div className="side-panel">
      <div className="side-panel-head">
        <span className="material-symbols-outlined">settings</span>
        <h2>设置</h2>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-title">深度工作保护</div>
            <div className="settings-desc">开启后，非 VIP 通知将被屏蔽，仅放行 VIP 与日历冲突。</div>
          </div>
          <button
            type="button"
            className={`toggle ${focusMode ? 'on' : ''}`}
            onClick={() => setFocusMode(!focusMode)}
            aria-pressed={focusMode}
          >
            <span className="toggle-knob" />
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-title">全局免打扰</div>
            <div className="settings-desc">屏蔽所有通知（含 VIP）。可自然语言「把通知都静音」一键开启。</div>
          </div>
          <button
            type="button"
            className={`toggle ${dndAll ? 'on' : ''}`}
            onClick={() => setDndAll(!dndAll)}
            aria-pressed={dndAll}
          >
            <span className="toggle-knob" />
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-title">重置演示</div>
            <div className="settings-desc">清空所有产物、线程、通知与节省时长，回到初始状态。</div>
          </div>
          <button type="button" className="settings-btn" onClick={resetDemo}>
            重置
          </button>
        </div>
      </div>

      <div className="settings-about">
        <div className="settings-about-title">关于</div>
        <p>
          Nexus OS — Liquid Light · 意图驱动 AI OS 空间界面 Demo（PRD v1.0 打工人办公场景）。
          本演示为前端模拟，所有数据均为本地 mock。
        </p>
        <p className="settings-tip">
          提示：主画布里的产物卡片可<b>拖拽头部移动</b>、<b>拖右下角手柄缩放</b>（窗口管理，PRD §5.1 P1）。
        </p>
      </div>
    </div>
  )
}
