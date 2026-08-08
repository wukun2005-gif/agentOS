import './Orb.css'

/**
 * F1: 能量光球渲染组件
 *
 * P0 阶段仅实现 Idle 态视觉：
 * - CSS radial-gradient + box-shadow 多层光叠加
 * - 5s 呼吸周期（scale 1.0 → 1.08）
 * - 双层光晕环（::before 4s / ::after 5s，素数周期避免同步）
 *
 * 光球居中定位（top 45%），直径 160px。
 * F2 将添加状态机切换其他 4 态视觉。
 */
export function Orb() {
  return (
    <div
      className="orb idle"
      role="img"
      aria-label="AI 能量光球 — 待命中"
    />
  )
}
