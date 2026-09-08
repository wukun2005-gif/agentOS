import { Orb } from './components/orb/Orb'
import { StateControls } from './components/controls/StateControls'
import { IntentInput } from './components/controls/IntentInput'
import { PromptLibrary } from './components/controls/PromptLibrary'
import { IntentCard } from './components/cards/IntentCard'
import { IntentHeader } from './components/cards/IntentHeader'
import { MorningBrief } from './components/panels/MorningBrief'
import { SidePanel } from './components/panels/SidePanel'
import { Dock } from './components/dock/Dock'
import { SystemTray } from './components/system-tray/SystemTray'
import { useOrbStore } from './store/useOrbStore'
import './App.css'

/**
 * Nexus OS — Liquid Light
 * 意图驱动 AI OS 空间界面（PRD v1.0 打工人办公场景）
 *
 * 布局：
 *   - 顶栏：品牌 + 系统托盘（时间/通知/今日节省）+ 头像
 *   - 侧栏：Core / Threads / History / Settings 玻璃导航（可点击切换视图）
 *   - 主画布上部：意图引言 + AI 复述 + 晨间简报条
 *   - 主画布中部：Core 光球 + 三层空间槽位上的产物卡片
 *   - 主画布底部：命令栏 + Dock 意图入口
 */
function App() {
  const view = useOrbStore((s) => s.view)
  const setView = useOrbStore((s) => s.setView)

  const navItems = [
    { key: 'core', icon: 'radio_button_checked', label: 'Core', fill: true },
    { key: 'threads', icon: 'bubble_chart', label: 'Threads', fill: false },
    { key: 'history', icon: 'history', label: 'History', fill: false },
    { key: 'settings', icon: 'settings', label: 'Settings', fill: false },
  ] as const

  return (
    <div className="app">
      {/* 顶部导航栏 — 品牌 + 系统托盘 */}
      <header className="top-bar">
        <div className="top-bar-brand">Nexus OS</div>
        <SystemTray />
      </header>

      {/* 侧边导航栏（桌面端） */}
      <nav className="side-nav">
        <div className="side-nav-items">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`side-nav-item ${view === item.key ? 'active' : ''}`}
              onClick={() => setView(item.key)}
            >
              <span
                className="material-symbols-outlined"
                style={item.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="side-nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 主画布 */}
      <main className="main-canvas">
        {view === 'core' ? (
          <>
            <div className="canvas-top">
              <IntentHeader />
              <MorningBrief />
            </div>

            <Orb />
            <IntentCard />

            <div className="canvas-bottom">
              <PromptLibrary />
              <IntentInput />
              <Dock />
            </div>
          </>
        ) : (
          <SidePanel />
        )}

        <StateControls />
      </main>
    </div>
  )
}

export default App
