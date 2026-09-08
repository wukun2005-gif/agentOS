import { MOCK_DIGEST } from '../mock/messages'
import type { MessageDigest } from './types'

/**
 * 工作沟通 Agent（PRD v1.0 §4.2.4）
 *
 * 频道摘要 → 任务提取 → 上下文恢复。Demo 只呈现前两段。
 */
export function getDigest(): MessageDigest {
  return MOCK_DIGEST
}

/** 从对话中提取的待办 */
export function extractTasks(digest: MessageDigest = MOCK_DIGEST) {
  return digest.extractedTasks
}
