/**
 * 窗口模型校验脚本
 *
 * 目的：把「App 是非模态窗口、OS shell 常驻」这条架构约束变成可执行断言，
 * 防止以后回退成"App 替换桌面、必须退出才能和 OS 说话"的设计。
 *
 * 核心断言：在窗口打开状态下运行意图，必须**同步**回到桌面（closeApp），
 * 这样用户才能在命令栏连续下指令、并看到新产出的卡片。
 *
 * 注：命令栏/Dock 常驻属于渲染层约束，由 App.tsx 保证（canvas-bottom
 * 不参与 activeApp 条件渲染，且 z-index 45 高于窗口 30）。
 *
 * 用法：npm run verify:window
 */
import { useOrbStore } from '../src/store/useOrbStore'
import { runIntentFlow, cancelIntentFlow } from '../src/logic/intentFlow'

const failures: string[] = []

function check(cond: boolean, msg: string) {
  if (!cond) failures.push(msg)
}

const s = () => useOrbStore.getState()

// 1. 初始状态：在桌面（没有窗口）
s().closeApp()
check(s().activeApp === null, '初始状态应在桌面（activeApp === null）')

// 2. 打开设置窗口
s().openApp('settings')
check(s().activeApp === 'settings', 'openApp(settings) 后应处于设置窗口')

// 3. 再次点击同一 App → 关闭（Dock 的 toggle 语义）
s().toggleApp('settings')
check(s().activeApp === null, 'toggleApp 同一 App 应关闭窗口回到桌面')

// 4. toggle 打开另一个 App
s().toggleApp('threads')
check(s().activeApp === 'threads', 'toggleApp(threads) 应打开会话线程窗口')

// 5. 窗口间直接切换
s().openApp('history')
check(s().activeApp === 'history', 'openApp(history) 应切换到活动历史窗口')

// 6. ★核心：窗口打开时运行意图，必须同步回到桌面
s().openApp('settings')
runIntentFlow('今天有什么必须我拍板的？')
check(
  s().activeApp === null,
  '窗口打开时运行意图应自动回到桌面（否则用户看不到新产物）',
)
cancelIntentFlow()

// 7. 重置演示应回到桌面
s().openApp('settings')
s().resetDemo()
check(s().activeApp === null, 'resetDemo 应回到桌面')

// 8. closeApp 幂等
s().closeApp()
s().closeApp()
check(s().activeApp === null, '重复 closeApp 应保持桌面状态')

if (failures.length > 0) {
  console.error(`✗ 窗口模型校验失败：${failures.length} 项`)
  for (const f of failures) console.error('  · ' + f)
  throw new Error('窗口模型校验失败')
}

console.log('✓ 窗口模型校验通过：App 为非模态窗口，运行意图自动回到桌面')
