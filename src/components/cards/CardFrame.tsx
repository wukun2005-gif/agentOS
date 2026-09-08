import type { ReactNode } from 'react'

/**
 * 卡片外壳 — 统一的玻璃拟态容器 + 头部 + 关闭 + 操作区
 * 所有产物卡片共用，保证视觉一致（PRD v1.0 §5.3 cards/）
 */

export type CardTone = 'primary' | 'warn' | 'success'

interface CardFrameProps {
  icon: string
  title: string
  badge: string
  tone?: CardTone
  wide?: boolean
  /** 用户缩放后的宽度（px），由窗口管理驱动（PRD §5.1 P1） */
  width?: number
  onClose?: () => void
  children: ReactNode
  actions?: ReactNode
}

export function CardFrame({
  icon,
  title,
  badge,
  tone = 'primary',
  wide = false,
  width,
  onClose,
  children,
  actions,
}: CardFrameProps) {
  return (
    <div
      className={`intent-card tone-${tone} ${wide ? 'wide' : ''}`}
      style={width ? { width: `${width}px` } : undefined}
    >
      <div className="intent-card-header">
        <div className="intent-card-icon">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="intent-card-title">{title}</span>
        <span className="intent-card-badge">{badge}</span>
        {onClose && (
          <button className="intent-card-close" onClick={onClose} aria-label="关闭卡片">
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>
      <div className="intent-card-body">{children}</div>
      {actions && <div className="intent-card-actions">{actions}</div>}
    </div>
  )
}

/** 卡片主操作按钮 */
export function CardButton({
  children,
  onClick,
  variant = 'ghost',
  disabled = false,
  icon,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'ghost' | 'primary' | 'done'
  disabled?: boolean
  icon?: string
}) {
  return (
    <button
      className={`card-btn ${variant}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {icon && <span className="material-symbols-outlined">{icon}</span>}
      {children}
    </button>
  )
}
