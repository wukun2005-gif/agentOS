import { useEffect } from 'react'
import { Orb } from './components/orb/Orb'
import { StateControls } from './components/controls/StateControls'
import { IntentInput } from './components/controls/IntentInput'
import { PromptLibrary } from './components/controls/PromptLibrary'
import { IntentCard } from './components/cards/IntentCard'
import { IntentHeader } from './components/cards/IntentHeader'
import { MorningBrief } from './components/panels/MorningBrief'
import { AppWindow } from './components/windows/AppWindow'
import { Dock } from './components/dock/Dock'
import { SystemTray } from './components/system-tray/SystemTray'
import { OneClickDemo } from './components/demo/OneClickDemo'
import { useOrbStore } from './store/useOrbStore'
import type { AppId } from './store/useOrbStore'
import './App.css'

/**
 * Nexus OS — Liquid Light
 * 意图驱动 AI OS 空间界面（PRD v1.0 打工人办公场景）
 *
 * 【核心架构：OS shell 常驻 + App 非模态窗口】
 *   OS shell = 顶栏 + 侧栏 + 命令栏 + Dock + 光球，**永远不会被卸载**。
 *   App（会话线程 / 活动历史 / 系统设置）是浮在桌面之上的**非模态窗口**，
 *   不是替换桌面的全屏视图 —— 用户开着设置窗口时，依然可以直接用命令栏
 *   与 OS 对话，无需先"退出设置"。
 *
 * 布局（z-index 由低到高）：
 *   - 光球 10 → 产物卡片 12 → canvas-top 25 → App 窗口 30
 *     → 命令栏 + Dock 45 → 侧栏 40 → 顶栏 50 → 托盘下拉 60
 *   注意命令栏(45) 高于窗口(30)，保证任何状态下都能与 OS 交互。
 */
function App() {
  const activeApp = useOrbStore((s) => s.activeApp)
  const toggleApp = useOrbStore((s) => s.toggleApp)
  const closeApp = useOrbStore((s) => s.closeApp)

  // Esc 关闭当前窗口，回到桌面
  useEffect(() => {
    if (!activeApp) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeApp()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeApp, closeApp])

  const navItems = [
    { key: 'core', icon: 'radio_button_checked', label: 'Core', fill: true, app: null },
    { key: 'threads', icon: 'bubble_chart', label: 'Threads', fill: false, app: 'threads' as AppId },
    { key: 'history', icon: 'history', label: 'History', fill: false, app: 'history' as AppId },
    { key: 'settings', icon: 'settings', label: 'Settings', fill: false, app: 'settings' as AppId },
  ] as const

  return (
    <div className="app">
      {/* 顶部导航栏 — 品牌 + 系统托盘（常驻） */}
      <header className="top-bar">
        <div className="top-bar-brand">Nexus OS</div>
        <OneClickDemo />
        <SystemTray />
      </header>

      {/* 侧边导航栏（常驻）：Core = 回桌面，其余 = 开关对应窗口 */}
      <nav className="side-nav">
        <div className="side-nav-items">
          {navItems.map((item) => {
            const active = item.app === null ? activeApp === null : activeApp === item.app
            return (
              <button
                key={item.key}
                type="button"
                data-app={item.app ?? 'core'}
                className={`side-nav-item ${active ? 'active' : ''}`}
                onClick={() => (item.app === null ? closeApp() : toggleApp(item.app))}
              >
                <span
                  className="material-symbols-outlined"
                  style={item.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="side-nav-label">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* 主画布 — 桌面内容常驻，App 窗口浮于其上 */}
      <main className="main-canvas">
        <div className={`canvas-top${activeApp ? ' canvas-top--behind' : ''}`}>
          <IntentHeader />
          <MorningBrief />
        </div>

        {/* 光球层：窗口打开时缩小到左下角，点击即回桌面 */}
        <div
          className={`orb-layer${activeApp ? ' orb-layer--mini' : ''}`}
          onClick={activeApp ? closeApp : undefined}
          title={activeApp ? '回到桌面' : undefined}
        >
          <Orb />
        </div>

        {/* 产物卡片：窗口打开时降级为"在窗口后面"，不拦截点击 */}
        <div className={`cards-layer${activeApp ? ' cards-layer--behind' : ''}`}>
          <IntentCard />
        </div>

        {/* App 窗口（非模态） */}
        <AppWindow />

        {/* 命令栏 + Dock（常驻，z-index 高于窗口，任何时刻都可交互） */}
        <div className="canvas-bottom">
          <PromptLibrary />
          <IntentInput />
          <Dock />
        </div>

        <StateControls />
      </main>
    </div>
  )
}

export default App
