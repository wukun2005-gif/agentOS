import { useOrbStore } from '../../store/useOrbStore'
import type { Artifact, IntentKind } from '../orb/OrbState'
import { CardButton, CardFrame } from './CardFrame'

/**
 * 生活场景卡片（PRD v0.2 保留）
 * 同一入口既能演示办公场景，也能演示天气/音乐/提醒等生活场景。
 */

interface CardConfig {
  icon: string
  title: string
  badge: string
}

const CARD_CONFIGS: Partial<Record<IntentKind, CardConfig>> = {
  weather: { icon: 'partly_cloudy_day', title: '天气预报', badge: 'WEATHER' },
  music: { icon: 'music_note', title: '音乐推荐', badge: 'MUSIC' },
  timer: { icon: 'timer', title: '计时器', badge: 'TIMER' },
  reminder: { icon: 'notifications', title: '提醒', badge: 'REMINDER' },
  note: { icon: 'sticky_note_2', title: '笔记', badge: 'NOTE' },
  search: { icon: 'search', title: '搜索结果', badge: 'SEARCH' },
  route: { icon: 'route', title: '路线', badge: 'ROUTE' },
}

function renderContent(kind: IntentKind, rawText: string) {
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
      )
    case 'reminder':
      return (
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
      )
    default:
      return (
        <div className="intent-card-row">
          <span className="intent-card-desc">{rawText}</span>
        </div>
      )
  }
}

export function LegacyCard({ artifact, rawText }: { artifact: Artifact; rawText: string }) {
  const dismissArtifact = useOrbStore((s) => s.dismissArtifact)
  const config = CARD_CONFIGS[artifact.kind as IntentKind] ?? CARD_CONFIGS.weather!

  return (
    <CardFrame
      icon={config.icon}
      title={config.title}
      badge={config.badge}
      onClose={() => dismissArtifact(artifact.id)}
      actions={
        <>
          <CardButton onClick={() => dismissArtifact(artifact.id)}>取消</CardButton>
          <CardButton variant="primary" onClick={() => dismissArtifact(artifact.id)}>
            确认
          </CardButton>
        </>
      }
    >
      {renderContent(artifact.kind as IntentKind, rawText)}
    </CardFrame>
  )
}
