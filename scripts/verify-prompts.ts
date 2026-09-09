/**
 * Prompt 校验脚本
 *
 * 目的：确保 PROMPT_LIBRARY 里每条 prompt 都是"真能用"的，而不是看着像。
 *
 * 校验两件事：
 *   1. 每条文案都能被 IntentRouter 命中到**期望的意图**
 *      （命中不了就会掉进 clarifying 澄清态，用户点了没反应）
 *   2. 标注了 expect 的文案，产出的**子分支产物**也要符合预期
 *      （比如"准备一下 10 点的评审会"必须产出会前准备卡，而不是会议纪要卡）
 *
 * 用法：npm run verify:prompts
 */
import { routeIntent } from '../src/logic/intentRouter'
import { buildArtifacts } from '../src/logic/artifactFactory'
import { PROMPT_LIBRARY } from '../src/mock/prompts'

const failures: string[] = []
let total = 0

for (const group of PROMPT_LIBRARY) {
  for (const item of group.items) {
    total++
    const tag = `[${group.title}] ${item.label}`
    const route = routeIntent(item.text)

    if (!route) {
      failures.push(`${tag} → 未命中任何意图（点击后会掉进澄清态）`)
      continue
    }

    if (route.kind !== group.kind) {
      failures.push(`${tag} → 命中 "${route.kind}"，期望 "${group.kind}"`)
      continue
    }

    if (!item.expect) continue

    const data = buildArtifacts(route)[0]?.data
    const ok = (() => {
      switch (item.expect) {
        case 'prep':
          return data?.type === 'prep'
        case 'reply':
          return data?.type === 'email' && data.mode === 'reply'
        case 'dnd':
        case 'open':
          return data?.type === 'setting' && data.result.setting === item.expect
        default:
          return true
      }
    })()

    if (!ok) {
      failures.push(`${tag} → 期望子分支 "${item.expect}"，实际产物 "${data?.type ?? '无'}"`)
    }
  }
}

if (failures.length > 0) {
  console.error(`✗ prompt 校验失败：${failures.length}/${total} 条不合规`)
  for (const f of failures) console.error('  · ' + f)
  throw new Error('prompt 校验失败')
}

console.log(`✓ prompt 校验通过：${total} 条全部命中期望意图与产物`)
