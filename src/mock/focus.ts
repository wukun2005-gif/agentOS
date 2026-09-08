import { SAVED_MINUTES, type FocusSession } from '../agents/types'

/**
 * 深度工作 mock（PRD v1.0 §4.2.6 深度工作保护）
 *
 * 进入专注态后，非 VIP 通知被屏障，仅 VIP 来电 / 日历冲突等紧急事项放行。
 * 价值量化：单次专注 90 分钟 ≈ 节省 38 分钟上下文切换损耗（取中位）。
 */
export const FOCUS_BLOCKED = ['非 VIP 邮件', 'IM 群消息', '日程提醒', '动态点赞']

export const FOCUS_ALLOW = ['VIP 来电', '日历冲突', '终审级审批']

export const SAVED_MINUTES_FOCUS = SAVED_MINUTES.focusSession

/** 可选时长档位（Dock / 命令栏快捷参数） */
export const FOCUS_DURATIONS = ['25 分钟', '50 分钟', '90 分钟']

export function getFocusSession(durationLabel = '90 分钟'): FocusSession {
  return {
    id: 'focus-1',
    durationLabel,
    startedAt: Date.now(),
    blocked: FOCUS_BLOCKED,
    allowThrough: FOCUS_ALLOW,
  }
}
