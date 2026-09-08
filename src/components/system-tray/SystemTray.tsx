import { Clock } from './Clock'
import { NotificationBell } from './NotificationBell'
import { useOrbStore } from '../../store/useOrbStore'
import { formatSaved } from '../../agents/types'
import './SystemTray.css'

/**
 * 系统托盘（PRD v1.0 §5.1）
 * 时间 · 通知 · 今日节省（效率提升可视化，PRD §1.4）
 *
 * 注：电量 / 网络属于设备级状态，Web App 无从感知，已移除——
 * 本 Demo 是桌面 Web 应用，不是移动 OS 状态栏。
 */
export function SystemTray() {
  const timeSaved = useOrbStore((s) => s.timeSaved)

  return (
    <div className="system-tray">
      {timeSaved > 0 && (
        <div className="tray-impact" title="今日累计节省时长（模拟值）">
          <span className="material-symbols-outlined">bolt</span>
          <span className="tray-impact-value">今日省 {formatSaved(timeSaved)}</span>
        </div>
      )}

      <Clock />

      <NotificationBell />

      <div className="top-bar-avatar" />
    </div>
  )
}
