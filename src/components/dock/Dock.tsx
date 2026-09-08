import { runIntentFlow } from '../../logic/intentFlow'
import './Dock.css'

/**
 * Dock 任务栏（PRD v1.0 §5.1）
 *
 * 不是 App 启动器，而是"意图入口"——每个图标直接派发一条意图，
 * 徽标显示各源待处理数量，避免用户先想"我要打开哪个 App"。
 */

interface DockItemData {
  id: string
  icon: string
  label: string
  badge?: number
  intent: string
  tone?: 'primary' | 'warn'
}

const DOCK_ITEMS: DockItemData[] = [
  { id: 'mail', icon: 'mail', label: 'Mail', badge: 3, intent: '看看有什么重要邮件', tone: 'warn' },
  { id: 'calendar', icon: 'calendar_month', label: 'Calendar', badge: 5, intent: '今天有什么重要的' },
  { id: 'chat', icon: 'forum', label: 'Chat', badge: 2, intent: '今天团队聊了什么', tone: 'warn' },
  { id: 'tasks', icon: 'task_alt', label: 'Tasks', badge: 7, intent: '会议结束了，帮我整理纪要' },
  { id: 'docs', icon: 'description', label: 'Docs', intent: '找一下 Q3 用户增长报告' },
]

export function DockItem({ item }: { item: DockItemData }) {
  return (
    <button
      className="dock-item"
      onClick={() => runIntentFlow(item.intent)}
      title={`${item.label} — ${item.intent}`}
      aria-label={`${item.label}，${item.intent}`}
      type="button"
    >
      <span className="material-symbols-outlined">{item.icon}</span>
      {item.badge ? <span className={`dock-badge ${item.tone ?? 'primary'}`}>{item.badge}</span> : null}
      <span className="dock-label">{item.label}</span>
    </button>
  )
}

export function Dock() {
  return (
    <nav className="dock" aria-label="意图入口">
      {DOCK_ITEMS.map((item) => (
        <DockItem key={item.id} item={item} />
      ))}
    </nav>
  )
}
