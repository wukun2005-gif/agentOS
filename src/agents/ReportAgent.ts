import { MOCK_WEEKLY_REPORT } from '../mock/reports'
import type { WeeklyReport } from './types'

/**
 * 周报 Agent（PRD v1.0 §4.2.7）
 *
 * 数据聚合 → AI 总结（成果 / 未完成任务 / 阻碍与风险）→ 结构化报告。
 */
export function getWeeklyReport(): WeeklyReport {
  return MOCK_WEEKLY_REPORT
}

/** 一键发送的对象 */
export function reportRecipients() {
  return ['直属主管', '项目组（4 人）']
}
