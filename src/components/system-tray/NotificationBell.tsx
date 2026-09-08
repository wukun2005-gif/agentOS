import { useState } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import { runIntentFlow } from '../../logic/intentFlow'
import './NotificationBell.css'

/**
 * 通知铃 + 通知中心（PRD v1.0 §5.1 系统托盘：通知）
 *
 * 未读以琥珀色徽标提示；点击展开最近 12 条系统消息。
 * 每条通知可点击 — 携带 action 的通知会让 OS 直接采取对应行为
 * （派发意图 / 切换侧栏视图），实现「通知即入口」。
 */
export function NotificationBell() {
  const notifications = useOrbStore((s) => s.notifications)
  const setView = useOrbStore((s) => s.setView)
  const markAllRead = useOrbStore((s) => s.markAllNotificationsRead)
  const [open, setOpen] = useState(false)

  const unread = notifications.filter((n) => !n.read).length

  const handleNotifClick = (action?: { kind: 'intent'; text: string } | { kind: 'view'; view: 'core' | 'threads' | 'history' | 'settings' } | { kind: 'dismiss' }) => {
    if (action?.kind === 'intent') {
      setView('core')
      runIntentFlow(action.text)
    } else if (action?.kind === 'view') {
      setView(action.view)
    }
    setOpen(false)
  }

  return (
    <div className="bell-wrap">
      <button
        className={`tray-icon-btn ${unread ? 'has-unread' : ''}`}
        onClick={() => {
          const next = !open
          setOpen(next)
          if (next) markAllRead()
        }}
        aria-label={`通知中心，${unread} 条未读`}
        aria-expanded={open}
        type="button"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unread > 0 && <span className="tray-badge">{unread}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-head">
            <span>通知中心</span>
            <button className="notif-close" onClick={() => setOpen(false)} aria-label="关闭通知中心">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="notif-list">
            {notifications.map((n) => (
              <button
                type="button"
                key={n.id}
                className={`notif-item ${n.tone} ${n.action ? 'clickable' : ''}`}
                onClick={() => handleNotifClick(n.action)}
                title={n.action ? '点击让 OS 处理' : undefined}
              >
                <span className="material-symbols-outlined">{n.icon}</span>
                <span className="notif-main">
                  <span className="notif-title">{n.title}</span>
                  {n.detail && <span className="notif-detail">{n.detail}</span>}
                </span>
                <span className="notif-time">{n.time}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
