/**
 * 校验「Threads 只装进行中的工作线程」语义（防回退）：
 *   1. 深度工作（持续任务）→ 线程 open=true，常驻 Threads
 *   2. 一次性意图（晨报）→ 线程 open=false，不进 Threads（去 History）
 *   3. 退出专注 → open 的 focus 线程自动 open=false
 *   4. 手动 closeThread → 该线程 open=false
 */
import { useOrbStore } from '../src/store/useOrbStore'
import { runIntentFlow } from '../src/logic/intentFlow'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const store = useOrbStore.getState()
  store.resetDemo()

  // 1) 深度工作 → open 常驻
  runIntentFlow('专注 25 分钟写方案，别打扰我')
  await wait(2400)
  let threads = useOrbStore.getState().threads
  const focusThread = threads.find((t) => t.kind === 'focus')
  if (!focusThread) throw new Error('FAIL: 深度工作未生成线程')
  if (!focusThread.open) throw new Error('FAIL: focus 线程应为 open=true（常驻 Threads）')

  // 2) 一次性意图（晨报）→ open=false
  runIntentFlow('今天有什么重要的')
  await wait(2400)
  threads = useOrbStore.getState().threads
  const briefThread = threads.find((t) => t.kind === 'brief')
  if (!briefThread) throw new Error('FAIL: 晨报未生成线程')
  if (briefThread.open) throw new Error('FAIL: 一次性意图线程应为 open=false（不进 Threads）')

  // Threads（仅 open）应只含 focus
  const openThreads = threads.filter((t) => t.open)
  if (openThreads.length !== 1 || openThreads[0].kind !== 'focus') {
    throw new Error(`FAIL: Threads 应只含 1 条 focus，实际 ${openThreads.length} 条`)
  }

  // 3) 退出专注 → focus 线程自动 open=false
  useOrbStore.getState().setFocusMode(false)
  threads = useOrbStore.getState().threads
  const stillOpen = threads.filter((t) => t.open)
  if (stillOpen.length !== 0) throw new Error('FAIL: 退出专注后不应有 open 线程')

  // 4) 手动 closeThread
  store.resetDemo()
  runIntentFlow('专注 25 分钟写方案，别打扰我')
  await wait(2400)
  const ft = useOrbStore.getState().threads.find((t) => t.kind === 'focus')!
  useOrbStore.getState().closeThread(ft.id)
  if (useOrbStore.getState().threads.find((t) => t.id === ft.id)!.open) {
    throw new Error('FAIL: closeThread 后线程应 open=false')
  }

  console.log('✓ Threads 语义校验通过：只装进行中的工作线程，完结即移出')
}

// 顶层 await（ESM）：失败时未捕获异常使 Node 以非零码退出，与另两个 verify 脚本一致
await main()
