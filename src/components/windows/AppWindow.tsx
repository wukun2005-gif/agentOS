import { useOrbStore } from '../../store/useOrbStore'
import type { AppId } from '../../store/useOrbStore'
import { runIntentFlow } from '../../logic/intentFlow'
import type { IntentKind } from '../orb/OrbState'
import './AppWindow.css'

/**
 * AppWindow — 浮在桌面之上的应用窗口（PRD v1.0 窗口管理心智）
 *
 * 架构要点：
 *   - **非模态**（aria-modal=false）：窗口打开时 OS shell 依然可用——
 *     命令栏、Dock、系统托盘都不会被卸载或遮挡。用户无需先"退出设置"
 *     才能和 OS 说话，这修复了早期"全屏视图替换桌面"的设计缺陷。
 *   - 桌面（Core）不是窗口，而是所有窗口关闭后的状态（activeApp === null）。
 *   - 运行新意图会自动关闭窗口回到桌面，让用户看到新产物（见 intentFlow）。
 */

const APP_META: Record<AppId, { icon: string; title: string; fill?: boolean }> = {
  threads: { icon: 'bubble_chart', title: '会话线程' },
  history: { icon: 'history', title: '活动历史' },
  settings: { icon: 'settings', title: '系统设置', fill: true },
}

/** 场景图标 + 中文名 */
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

export function AppWindow() {
  const activeApp = useOrbStore((s) => s.activeApp)
  const closeApp = useOrbStore((s) => s.closeApp)

  if (!activeApp) return null

  const meta = APP_META[activeApp]

  return (
    <div className="app-window" role="dialog" aria-modal="false" aria-label={meta.title}>
      <div className="app-window-bar">
        <span
          className="material-symbols-outlined app-window-icon"
          style={meta.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {meta.icon}
        </span>
        <span className="app-window-title">{meta.title}</span>
        <button
          type="button"
          className="app-window-close"
          onClick={closeApp}
          aria-label="关闭窗口"
          title="关闭（Esc）"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="app-window-body">
        {activeApp === 'threads' && <ThreadsPanel />}
        {activeApp === 'history' && <HistoryPanel />}
        {activeApp === 'settings' && <SettingsPanel />}
      </div>

      {/* 非模态提示：明确告诉用户无需先关闭窗口 */}
      <div className="app-window-foot">
        <span className="material-symbols-outlined">keyboard_command_key</span>
        无需关闭窗口 — 直接在下方命令栏说出下一个意图，会自动回到桌面
      </div>
    </div>
  )
}

/** —— 会话线程 —— */
function ThreadsPanel() {
  const threads = useOrbStore((s) => s.threads)

  if (threads.length === 0) {
    return (
      <div className="panel-empty">
        还没有运行过意图。在命令栏说一句话或点一个提示词，就会在这里生成一条线程。
      </div>
    )
  }

  return (
    <ul className="thread-list">
      {threads.map((t) => {
        const m = kindMeta(t.kind)
        return (
          <li key={t.id}>
            <button
              type="button"
              className="thread-item"
              onClick={() => runIntentFlow(t.query)}
              title="重放此意图（会自动回到桌面）"
            >
              <span className="material-symbols-outlined thread-icon">{m.icon}</span>
              <span className="thread-body">
                <span className="thread-query">{t.query}</span>
                <span className="thread-meta">
                  <span className={`thread-tag tag-${t.kind}`}>{m.label}</span>
                  <span className="thread-time">{t.time}</span>
                  <span className="thread-count">{t.artifactCount} 产物</span>
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** —— 活动历史 —— */
function HistoryPanel() {
  const threads = useOrbStore((s) => s.threads)
  const notifications = useOrbStore((s) => s.notifications)

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

  if (events.length === 0) return <div className="panel-empty">暂无活动记录。</div>

  return (
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
  )
}

/** —— 系统设置 —— */
function SettingsPanel() {
  const focusMode = useOrbStore((s) => s.focusMode)
  const setFocusMode = useOrbStore((s) => s.setFocusMode)
  const dndAll = useOrbStore((s) => s.dndAll)
  const setDndAll = useOrbStore((s) => s.setDndAll)
  const resetDemo = useOrbStore((s) => s.resetDemo)

  return (
    <>
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
    </>
  )
}
