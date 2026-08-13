import { Orb } from './components/orb/Orb'
import { StateControls } from './components/controls/StateControls'
import { IntentInput } from './components/controls/IntentInput'
import { IntentCard } from './components/cards/IntentCard'
import './App.css'

/**
 * Nexus OS — Liquid Light
 * 意图驱动 AI OS 空间界面
 */
function App() {
  return (
    <div className="app">
      {/* 顶部导航栏 */}
      <header className="top-bar">
        <div className="top-bar-brand">Nexus OS</div>
        <div className="top-bar-status">
          <span className="material-symbols-outlined status-icon">signal_cellular_alt</span>
          <span className="material-symbols-outlined status-icon">battery_very_low</span>
          <span className="material-symbols-outlined status-icon">wifi</span>
          <div className="top-bar-avatar" />
        </div>
      </header>

      {/* 侧边导航栏（桌面端） */}
      <nav className="side-nav">
        <div className="side-nav-items">
          <div className="side-nav-item active">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              radio_button_checked
            </span>
            <span className="side-nav-label">Core</span>
          </div>
          <div className="side-nav-item">
            <span className="material-symbols-outlined">bubble_chart</span>
            <span className="side-nav-label">Threads</span>
          </div>
          <div className="side-nav-item">
            <span className="material-symbols-outlined">history</span>
            <span className="side-nav-label">History</span>
          </div>
          <div className="side-nav-item">
            <span className="material-symbols-outlined">settings</span>
            <span className="side-nav-label">Settings</span>
          </div>
        </div>
      </nav>

      {/* 主画布 */}
      <main className="main-canvas">
        <Orb />
        <IntentCard />
        <StateControls />
        <IntentInput />
      </main>

      {/* 移动端底部导航 */}
      <nav className="bottom-nav">
        <div className="bottom-nav-item active">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            graphic_eq
          </span>
          <span className="bottom-nav-label">Nexus</span>
        </div>
        <div className="bottom-nav-item">
          <span className="material-symbols-outlined">widgets</span>
          <span className="bottom-nav-label">Workspace</span>
        </div>
        <div className="bottom-nav-item">
          <span className="material-symbols-outlined">database</span>
          <span className="bottom-nav-label">Memory</span>
        </div>
      </nav>
    </div>
  )
}

export default App
