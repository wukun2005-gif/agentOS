import { useEffect, useRef } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import { runIntentFlow } from '../../logic/intentFlow'
import type { AppId } from '../../store/useOrbStore'
import './OneClickDemo.css'

/**
 * 一键演示 — 参考 agentEvalPlatform 的 ▶ 一键演示
 *
 * 设计对齐参考项目：
 *   - 声明式 DEMO_SCRIPT（每步 action + 文案 + 时长）
 *   - 动画游标 + Tooltip + 顶部进度条
 *   - Esc / 点击任意处退出
 *   - 暂停式逐帧讲解：每步把观众的注意力引到具体 UI 上
 *
 * 与本 OS 的适配：
 *   - 用 useOrbStore 驱动真实引擎（openApp / closeApp / resetDemo / commandDraft）
 *   - 意图通过 runIntentFlow 走与「手敲回车」完全相同的路径，保证演示即真实行为
 *   - 打开 App / 通知中心 / 点击通知，都走**真实 DOM 点击**（游标先移到目标、出现点击动画、
 *     再 dispatch click），避免「窗口凭空弹出」的突兀感
 *   - 游标/tooltip 用 ref 直接操作 DOM（避免每帧 re-render 整棵树）
 */

type DemoStep =
  | { kind: 'announce'; text: string; wait?: number }
  | { kind: 'intent'; query: string; note: string; wait?: number }
  | { kind: 'openApp'; app: AppId; note: string; wait?: number }
  | { kind: 'closeApp'; wait?: number }
  | { kind: 'reset'; wait?: number }
  | { kind: 'wait'; ms: number }
  | { kind: 'point'; selector: string; text: string; wait?: number }
  /** 通知中心：真实打开并点击一条通知，演示「通知即入口」 */
  | { kind: 'notif'; note: string; clickNote: string; resultNote: string; wait?: number }
  /** 进行中的工作线程：打开 Threads，展示 ongoing 线程，并演示手动结束一条 */
  | { kind: 'threadsShow'; openNote: string; closeNote: string; wait?: number }

const DEMO_SCRIPT: DemoStep[] = [
  // ── 开场 ───────────────────────────────────────
  { kind: 'reset', wait: 600 },
  {
    kind: 'announce',
    text: 'Nexus OS — 打工人的 AI 桌面操作系统。一句话，OS 替你办完一天。',
    wait: 3200,
  },
  {
    kind: 'announce',
    text: '提示：演示中可随时按 Esc 或点击任意处退出。现在从「晨间简报」开始。',
    wait: 2400,
  },

  // ── 场景 1：晨间简报 ──────────────────────────
  {
    kind: 'intent',
    query: '今天有什么重要的',
    note: '晨间简报：117 封邮件、153 条消息、8 个会，一句话汇总成优先级清单',
    wait: 3600,
  },

  // ── 场景 2：邮件分诊 ──────────────────────────
  {
    kind: 'intent',
    query: '哪些邮件拖了 3 天还没回',
    note: '邮件分诊：超时未回置顶、VIP 优先，跟进遗漏不再发生',
    wait: 3600,
  },

  // ── 场景 3：会议纪要 ───────────────────────────
  {
    kind: 'intent',
    query: '刚才的会里哪些 action 归我',
    note: '会议纪要：决策 + 行动项，只标出「归我」的那几条',
    wait: 3600,
  },

  // ── 场景 4：沟通摘要 ───────────────────────────
  {
    kind: 'intent',
    query: '#project-alpha 提到我什么',
    note: '沟通摘要：153 条消息里只留下 @你 的，响应压力归零',
    wait: 3600,
  },

  // ── 场景 5：文档检索 ───────────────────────────
  {
    kind: 'intent',
    query: '找一下最新版本的方案，别给我旧版',
    note: '文档检索：跨邮件 / 云盘 / 会议，锁定最新版，版本混乱终结',
    wait: 3600,
  },

  // ── 场景 6：深度工作 ───────────────────────────
  {
    kind: 'intent',
    query: '专注 90 分钟写 PRD，别打扰我',
    note: '深度工作：进入即屏蔽非 VIP 通知，平均专注从 13 分 7 秒拉满',
    wait: 3600,
  },

  // ── 场景 7：智能周报 ───────────────────────────
  {
    kind: 'intent',
    query: '帮我写本周周报',
    note: '智能周报：流水账自动变复盘，卡住的事单独标红',
    wait: 3600,
  },

  // ── 通知中心：真实打开并点击执行 ───────────────
  {
    kind: 'notif',
    note: '打开通知中心：点顶部铃铛',
    clickNote: '点这条 CEO 邮件 → OS 直接替你回复，处理完通知即消失',
    resultNote: '通知即入口 —— 点一下，OS 替你执行；执行完，通知自动清除',
    wait: 3800,
  },

  // ── 左侧栏：Threads（只装进行中的工作线程）─────
  {
    kind: 'threadsShow',
    openNote:
      'Threads 只装「进行中的工作线程」：深度专注正挂在这里、进行中（绿色脉冲）。晨报 / 邮件 / 会议这些跑完即完结的意图不进这一栏 —— 去 History 看。',
    closeNote: '并行的工作线程也能手动结束：点 ×，它立即移出 Threads，但完整记录留在 History。',
    wait: 3600,
  },

  // ── 左侧栏：History（完整时间线，含已完结）────
  {
    kind: 'openApp',
    app: 'history',
    note: '左侧 History：意图 + 通知的完整时间线 —— 包括已完结、已移出 Threads 的线程，全天操作可追溯',
    wait: 3000,
  },
  { kind: 'closeApp', wait: 700 },

  // ── 结尾 ───────────────────────────────────────
  {
    kind: 'point',
    selector: '.tray-impact',
    text: '今日已为你节省的时间（模拟值）—— 一句话办完一天。这就是 Nexus OS。',
    wait: 3400,
  },
  {
    kind: 'announce',
    text: 'Nexus OS — 让每个打工人都拥有一个随叫随到的 AI 桌面。',
    wait: 2800,
  },
]

export function OneClickDemo() {
  const playingRef = useRef(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // ── 游标 / tooltip 操作（ref 直改 DOM，避免逐帧 re-render） ──
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
  const checkCancelled = () => {
    if (!playingRef.current) throw new Error('__CANCELLED__')
  }

  const moveCursor = (x: number, y: number) => {
    const c = cursorRef.current
    if (!c) return
    c.style.display = 'block'
    c.style.left = `${x - 12}px`
    c.style.top = `${y - 12}px`
  }

  const showTooltip = (text: string, x: number, y: number) => {
    const t = tooltipRef.current
    if (!t) return
    t.textContent = text
    t.style.display = 'block'
    const rect = t.getBoundingClientRect()
    const margin = 12
    const gap = 22
    const placeRight = x < 360 && x + gap + rect.width + margin < window.innerWidth
    const left = placeRight ? x + gap : x - rect.width / 2
    const clampedLeft = Math.max(margin, Math.min(left, window.innerWidth - rect.width - margin))
    const top = y > window.innerHeight - 90 ? y - rect.height - 16 : y + 30
    t.style.left = `${clampedLeft}px`
    t.style.top = `${top}px`
  }

  const hideCursor = () => {
    if (cursorRef.current) cursorRef.current.style.display = 'none'
    if (tooltipRef.current) tooltipRef.current.style.display = 'none'
  }

  const setProgress = (pct: number) => {
    if (progressRef.current) progressRef.current.style.width = `${pct}%`
  }

  /** 游标点击动画：快速缩小一下，模拟「按下」 */
  const clickCursor = async () => {
    const c = cursorRef.current
    if (c) c.classList.add('clicking')
    await wait(170)
    if (c) c.classList.remove('clicking')
    await wait(110)
  }

  /** 游标移到元素中心 → 讲解 → 点击动画 → 真实 dispatch click */
  const clickEl = async (el: HTMLElement, note?: string) => {
    const r = el.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    moveCursor(x, y)
    if (note) showTooltip(note, x, y)
    await wait(560)
    await clickCursor()
    el.click()
  }

  const pointTo = async (selector: string, text: string, waitMs = 2400) => {
    checkCancelled()
    const el = document.querySelector(selector) as HTMLElement | null
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      await wait(450)
      const r = el.getBoundingClientRect()
      const x = r.left + r.width / 2
      const y = r.top + r.height / 2
      moveCursor(x, y)
      showTooltip(text, x, y)
    } else {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      moveCursor(cx, cy)
      showTooltip(text, cx, cy)
    }
    await wait(waitMs)
  }

  const goCenter = async (text: string, waitMs = 2400) => {
    checkCancelled()
    const x = window.innerWidth / 2
    const y = window.innerHeight / 2
    moveCursor(x, y)
    showTooltip(text, x, y)
    await wait(waitMs)
  }

  // 打字机：把 query 逐字写入命令栏（复用 store.commandDraft）
  const typeIntoCommandBar = async (text: string) => {
    const store = useOrbStore.getState()
    for (let i = 1; i <= text.length; i++) {
      checkCancelled()
      store.setCommandDraft(text.slice(0, i))
      await wait(32)
    }
  }

  // 打开 App 窗口：先用游标真实点击左侧栏按钮（避免凭空弹出），再讲解
  const openAppStep = async (app: AppId, note: string, waitMs = 2800) => {
    checkCancelled()
    const label = app === 'threads' ? 'Threads' : app === 'history' ? 'History' : 'Settings'
    const btn = document.querySelector(`[data-app="${app}"]`) as HTMLElement | null
    if (btn) {
      await clickEl(btn, `点击左侧栏 · ${label}`)
    } else {
      useOrbStore.getState().openApp(app)
      await wait(400)
    }
    await wait(700)
    await pointTo('.app-window', note, waitMs)
  }

  // 通知中心：真实点击铃铛打开，再点击一条通知演示「通知即入口」
  const notifStep = async (note: string, clickNote: string, resultNote: string, waitMs = 3200) => {
    checkCancelled()
    const bell = document.querySelector('[aria-label^="通知中心"]') as HTMLElement | null
    if (bell) await clickEl(bell, note)
    else return
    await wait(650) // 等待面板展开动画

    const target = (document.querySelector('[data-notif="n1"]') ||
      document.querySelector('.notif-item.clickable')) as HTMLElement | null
    if (target) {
      const r = target.getBoundingClientRect()
      const x = r.left + r.width / 2
      const y = r.top + r.height / 2
      moveCursor(x, y)
      showTooltip(clickNote, x, y)
      await wait(950)
      await clickCursor()
      target.click() // 触发 handleNotifClick → 执行意图 + 消费通知 + 关闭面板
    }
    await wait(2400) // 等待意图流转产出卡片
    await pointTo('.cards-layer', resultNote, waitMs)
  }

  // 进行中的工作线程：打开 Threads，展示 ongoing 线程，并演示手动结束一条
  const threadsShowStep = async (openNote: string, closeNote: string, waitMs = 3200) => {
    checkCancelled()
    await openAppStep('threads', openNote, 3400)

    // 演示手动结束一条进行中的线程（点 × → closeThread，移出 Threads，留在 History）
    const endBtn = document.querySelector('.thread-end') as HTMLElement | null
    if (endBtn) {
      const r = endBtn.getBoundingClientRect()
      const x = r.left + r.width / 2
      const y = r.top + r.height / 2
      moveCursor(x, y)
      showTooltip(closeNote, x, y)
      await wait(1200)
      await clickCursor()
      endBtn.click()
    }
    await wait(waitMs)
  }

  const runDemo = async () => {
    if (playingRef.current) return
    playingRef.current = true
    if (overlayRef.current) overlayRef.current.style.display = 'block'

    // 点击任意处退出
    const catcher = overlayRef.current?.querySelector('.demo-click-catcher') as HTMLElement | null
    if (catcher) catcher.onclick = stopDemo

    const store = useOrbStore.getState()
    const total = DEMO_SCRIPT.length

    try {
      for (let i = 0; i < total; i++) {
        if (!playingRef.current) break
        const step = DEMO_SCRIPT[i]
        setProgress(((i + 1) / total) * 100)

        switch (step.kind) {
          case 'announce':
            await goCenter(step.text, step.wait ?? 2400)
            break

          case 'reset':
            store.resetDemo()
            await wait(step.wait ?? 600)
            break

          case 'intent': {
            checkCancelled()
            // 1) 打字到命令栏 + 指向输入框
            const bar = document.querySelector('.intent-command-bar') as HTMLElement | null
            if (bar) {
              const r = bar.getBoundingClientRect()
              moveCursor(r.left + r.width / 2, r.top + r.height / 2)
              showTooltip(`输入：「${step.query}」`, r.left + r.width / 2, r.top)
            }
            await wait(500)
            await typeIntoCommandBar(step.query)
            await wait(450)

            // 2) 真正派发意图（与回车提交同路径）
            runIntentFlow(step.query)

            // 3) 思考中：指向光球
            const orb = document.querySelector('.orb-container') as HTMLElement | null
            if (orb) {
              const r = orb.getBoundingClientRect()
              moveCursor(r.left + r.width / 2, r.top + r.height / 2)
              showTooltip('理解中…', r.left + r.width / 2, r.top)
            } else {
              await goCenter('理解中…', 1200)
            }
            await wait(2200)

            // 4) 产物出现：指向卡片区，讲解价值
            await pointTo('.cards-layer', step.note, step.wait ?? 3400)
            break
          }

          case 'openApp':
            await openAppStep(step.app, step.note, step.wait ?? 2800)
            break

          case 'notif':
            await notifStep(step.note, step.clickNote, step.resultNote, step.wait ?? 3200)
            break

          case 'threadsShow':
            await threadsShowStep(step.openNote, step.closeNote, step.wait ?? 3200)
            break

          case 'closeApp':
            store.closeApp()
            await wait(step.wait ?? 600)
            break

          case 'wait':
            await wait(step.ms)
            break

          case 'point':
            await pointTo(step.selector, step.text, step.wait ?? 2400)
            break
        }
      }
    } catch (err) {
      if ((err as Error).message !== '__CANCELLED__') console.error('Demo error:', err)
    }

    stopDemo()
  }

  const stopDemo = () => {
    playingRef.current = false
    useOrbStore.getState().setCommandDraft('')
    hideCursor()
    setProgress(0)
    if (overlayRef.current) overlayRef.current.style.display = 'none'
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && playingRef.current) stopDemo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const launch = () => {
    if (!playingRef.current) runDemo()
  }

  return (
    <>
      <button
        type="button"
        className="demo-launch-btn"
        onClick={launch}
        aria-label="一键演示"
        title="自动播放完整场景演示"
      >
        <span className="material-symbols-outlined">play_circle</span>
        一键演示
      </button>

      <div className="demo-overlay" ref={overlayRef} style={{ display: 'none' }}>
        <div className="demo-click-catcher" />
        <div className="demo-progress">
          <div className="demo-progress-bar" ref={progressRef} />
        </div>
        <div className="demo-tooltip" ref={tooltipRef} />
        <div className="demo-cursor" ref={cursorRef}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 2L20 10.6667L12 13L10 21L4 2Z"
              fill="white"
              stroke="#00f0ff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </>
  )
}
