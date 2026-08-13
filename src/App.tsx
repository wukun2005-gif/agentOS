import { Orb } from './components/orb/Orb'
import { StateControls } from './components/controls/StateControls'
import { IntentInput } from './components/controls/IntentInput'
import { IntentCard } from './components/cards/IntentCard'
import { IntentHeader } from './components/cards/IntentHeader'
import './App.css'

/**
 * Nexus OS — Liquid Light
 * 意图驱动 AI OS 空间界面
 *
 * 布局对照设计稿：
 *   - 顶栏：品牌 + 头像（桌面 web app，无手机状态栏图标 — 对照 nexus_os_1/4）
 *   - 侧栏：Core / Threads / History / Settings 玻璃导航
 *   - 主画布：Core 居中 + 顶部意图引言 + 浮动卡片 + 底部命令栏
 */
function App() {
  return (
    <div className="app">
      {/* 顶部导航栏 — 品牌 + 头像（已移除 signal/battery/wifi 手机 mockup 残留） */}
      <header className="top-bar">
        <div className="top-bar-brand">Nexus OS</div>
        <div className="top-bar-status">
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
        <IntentHeader />
        <Orb />
        <IntentCard />
        <IntentInput />
        <StateControls />
      </main>
    </div>
  )
}

export default App
