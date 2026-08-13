import { useOrbStore } from '../../store/useOrbStore'
import type { Artifact, IntentKind } from '../orb/OrbState'
import './IntentCard.css'

/**
 * F7: Intent Cards — 任务产物（PRD v0.2 §6 + Nexus OS Liquid Light）
 *
 * 当意图流程进入 executing/responding 态时，显示 glassmorphism 卡片。
 * 卡片根据意图类型渲染不同内容：
 *   - weather: 温度 + 天气图标 + 描述
 *   - music: 歌曲名 + 艺术家 + 播放按钮
 *   - timer: 倒计时 + 提醒内容
 *   - reminder: 提醒内容 + 时间
 */

interface CardConfig {
  icon: string
  title: string
  badge: string
  position: 'right' | 'left' | 'top'
}

const CARD_CONFIGS: Record<IntentKind, CardConfig> = {
  weather: { icon: 'partly_cloudy_day', title: '天气预报', badge: 'Weather', position: 'right' },
  music: { icon: 'music_note', title: '音乐推荐', badge: 'Music', position: 'left' },
  timer: { icon: 'timer', title: '计时器', badge: 'Timer', position: 'right' },
  reminder: { icon: 'notifications', title: '提醒', badge: 'Reminder', position: 'right' },
  note: { icon: 'sticky_note_2', title: '笔记', badge: 'Note', position: 'left' },
  search: { icon: 'search', title: '搜索结果', badge: 'Search', position: 'right' },
  route: { icon: 'route', title: '路线', badge: 'Route', position: 'left' },
}

function renderCardContent(kind: IntentKind, rawText: string) {
  switch (kind) {
    case 'weather':
      return (
        <>
          <div className="intent-card-row">
            <span className="intent-card-label">北京 · 明天</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)' }}>
              partly_cloudy_day
            </span>
          </div>
          <div className="intent-card-row highlight">
            <div>
              <div className="intent-card-value large">18°</div>
              <div className="intent-card-desc" style={{ marginTop: '4px' }}>
                多云转晴，晚间有微风
              </div>
            </div>
            <span className="intent-card-label">12° / 22°</span>
          </div>
        </>
      )
    case 'music':
      return (
        <>
          <div className="intent-card-row highlight">
            <div>
              <div className="intent-card-value primary">Rainy Day Jazz</div>
              <div className="intent-card-desc" style={{ marginTop: '4px' }}>
                Norah Jones · Come Away with Me
              </div>
            </div>
            <span
              className="material-symbols-outlined"
              style={{ color: 'var(--primary-container)', fontSize: '28px' }}
            >
              play_circle
            </span>
          </div>
          <div className="intent-card-row">
            <span className="intent-card-label">时长</span>
            <span className="intent-card-value">3:45</span>
          </div>
        </>
      )
    case 'timer':
      return (
        <>
          <div className="intent-card-row highlight">
            <div>
              <div className="intent-card-value large">15:00</div>
              <div className="intent-card-desc" style={{ marginTop: '4px' }}>
                {rawText}
              </div>
            </div>
            <span
              className="material-symbols-outlined"
              style={{ color: 'var(--primary-container)', fontSize: '28px' }}
            >
              timer
            </span>
          </div>
        </>
      )
    case 'reminder':
      return (
        <>
          <div className="intent-card-row highlight">
            <div>
              <div className="intent-card-value primary">{rawText}</div>
              <div className="intent-card-desc" style={{ marginTop: '4px' }}>
                已设置提醒 · 15 分钟后
              </div>
            </div>
            <span
              className="material-symbols-outlined"
              style={{ color: 'var(--primary-container)', fontSize: '24px' }}
            >
              notifications_active
            </span>
          </div>
        </>
      )
    default:
      return (
        <div className="intent-card-row">
          <span className="intent-card-desc">{rawText}</span>
        </div>
      )
  }
}

export function IntentCard() {
  const artifacts = useOrbStore((s) => s.artifacts)
  const orbState = useOrbStore((s) => s.orbState)
  const transcript = useOrbStore((s) => s.transcript)

  // 仅在 executing/responding 态显示卡片
  if (orbState !== 'executing' && orbState !== 'responding') return null
  if (artifacts.length === 0) return null

  return (
    <div className="intent-cards-container">
      {artifacts.map((artifact: Artifact) => {
        const kind = artifact.kind as IntentKind
        const config = CARD_CONFIGS[kind] || CARD_CONFIGS.weather

        return (
          <div
            key={artifact.id}
            className={`intent-card position-${config.position}`}
          >
            <div className="intent-card-header">
              <div className="intent-card-icon">
                <span className="material-symbols-outlined">{config.icon}</span>
              </div>
              <span className="intent-card-title">{config.title}</span>
              <span className="intent-card-badge">{config.badge}</span>
            </div>
            <div className="intent-card-body">{renderCardContent(kind, transcript)}</div>
            <div className="intent-card-actions">
              <button className="intent-card-btn">取消</button>
              <button className="intent-card-btn primary">确认</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
