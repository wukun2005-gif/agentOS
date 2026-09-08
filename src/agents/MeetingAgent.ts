import { MOCK_MINUTES } from '../mock/meetings'
import { MOCK_PREP } from '../mock/meetingPrep'
import type { MeetingMinutes, MeetingPrep } from './types'

/**
 * 会议 Agent（PRD v1.0 §4.2.3 会议全链路自动化）
 *
 * - 会后处理：结构化纪要 + 行动项 + 同步动作
 * - 会前准备：议程 / 待读材料 / 参会人对齐项 / 遗留议题 / 风险预警
 */

/** 会后：生成结构化纪要 */
export function getMinutes(): MeetingMinutes {
  return MOCK_MINUTES
}

/** 会前：生成准备清单 */
export function getPrep(): MeetingPrep {
  return MOCK_PREP
}

/** 待办同步到 Jira 后的任务编号 */
export function jiraKeys(minutes: MeetingMinutes) {
  return minutes.actionItems.map((item, i) => `AURA-${218 + i} · ${item.text}`)
}

