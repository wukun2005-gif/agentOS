import { getFocusSession } from '../mock/focus'
import type { FocusSession } from './types'

/**
 * 深度工作 Agent（PRD v1.0 §4.2.6）
 *
 * 解析专注时长 → 生成屏障策略（屏蔽类型 + 放行紧急类型）。
 */
export function getFocusPlan(durationLabel?: string): FocusSession {
  return getFocusSession(durationLabel)
}

/** Dock 默认触发「深度工作」用的时长文案 */
export function defaultFocusDuration(): string {
  return '90 分钟'
}
