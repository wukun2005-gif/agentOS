/**
 * AI 光球状态机 — 5 态
 *
 * Idle         — 待命，青绿色缓慢呼吸
 * Listening    — 接收中，快速脉动
 * Understanding — 理解中，向内收缩（空间隐喻）
 * Thinking     — 深度处理，旋转脉动
 * Responding   — 输出，暖金色轻摆
 */
export type OrbState =
  | 'idle'
  | 'listening'
  | 'understanding'
  | 'thinking'
  | 'responding'

/** 状态中文标签 */
export const ORB_STATE_LABELS: Record<OrbState, string> = {
  idle: '待命',
  listening: '聆听中',
  understanding: '理解中',
  thinking: '思考中',
  responding: '回应中',
}
