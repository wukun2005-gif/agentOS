import { useState } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import type { Notification } from '../../store/useOrbStore'
import { runIntentFlow } from '../../logic/intentFlow'
import './NotificationBell.css'

/**
 * 通知铃 + 通知中心（PRD v1.0 §5.1 系统托盘：通知）
 *
 * 未读以琥珀色徽标提示；点击展开最近 12 条系统消息。
 * 每条通知可点击 — 携带 action 的通知会让 OS 直接采取对应行为
 * （派发意图 / 打开应用窗口），实现「通知即入口」。
 */
export function NotificationBell() {
  const notifications = useOrbStore((s) => s.notifications)
  const openApp = useOrbStore((s) => s.openApp)
  const markAllRead = useOrbStore((s) => s.markAllNotificationsRead)
  const consumeNotification = useOrbStore((s) => s.consumeNotification)
  const clearNotifications = useOrbStore((s) => s.clearNotifications)
  const [open, setOpen] = useState(false)

  const unread = notifications.filter((n) => !n.read).length

  /**
   * 点击可操作通知：执行动作，并从中心移除（消费）。
   * 这样「点完即消失」，既不会留在中心，也不会被再次点击重复触发
   * （例如重复发送同一封邮件、重复累加节省时长）。
   */
  const handleNotifClick = (n: Notification) => {
    const action = n.action
    if (!action) return // 结果类通知不可操作，点击无副作用
    if (action.kind === 'intent') {
      // runIntentFlow 会自动关闭当前窗口回到桌面，让用户看到新产物
      runIntentFlow(action.text)
    } else if (action.kind === 'app') {
      openApp(action.app)
    }
    consumeNotification(n.id)
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
            <div className="notif-head-actions">
              {notifications.length > 0 && (
                <button
                  className="notif-clear-all"
                  onClick={() => clearNotifications()}
                  type="button"
                >
                  清空
                </button>
              )}
              <button className="notif-close" onClick={() => setOpen(false)} aria-label="关闭通知中心">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
          <div className="notif-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                data-notif={n.id}
                className={`notif-item ${n.tone} ${n.action ? 'clickable' : ''}`}
                onClick={n.action ? () => handleNotifClick(n) : undefined}
                role={n.action ? 'button' : undefined}
                tabIndex={n.action ? 0 : undefined}
                title={n.action ? '点击让 OS 处理' : undefined}
                onKeyDown={
                  n.action
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleNotifClick(n)
                        }
                      }
                    : undefined
                }
              >
                <span className="material-symbols-outlined">{n.icon}</span>
                <span className="notif-main">
                  <span className="notif-title">{n.title}</span>
                  {n.detail && <span className="notif-detail">{n.detail}</span>}
                </span>
                <span className="notif-time">{n.time}</span>
                <button
                  type="button"
                  className="notif-dismiss"
                  aria-label="清除此通知"
                  onClick={(e) => {
                    e.stopPropagation()
                    consumeNotification(n.id)
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
