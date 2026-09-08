import { useEffect, useRef } from 'react'
import { useOrbStore } from '../../store/useOrbStore'
import type { Artifact } from '../orb/OrbState'
import { CardButton, CardFrame } from './CardFrame'

/**
 * 自然语言设置卡片（PRD v1.0 §5.1 P2 系统设置控制）
 *
 * - dnd：进入即自动开启全局免打扰（屏蔽所有通知），并给出已应用确认
 * - open：自动跳转到设置面板
 */
export function SettingCard({ artifact }: { artifact: Artifact }) {
  const setDndAll = useOrbStore((s) => s.setDndAll)
  const setView = useOrbStore((s) => s.setView)
  const pushNotification = useOrbStore((s) => s.pushNotification)
  const dismissArtifact = useOrbStore((s) => s.dismissArtifact)
  const updateArtifact = useOrbStore((s) => s.updateArtifact)
  const appliedRef = useRef(false)

  const data = artifact.data

  useEffect(() => {
    if (!data || data.type !== 'setting') return
    const result = data.result
    if (result.setting === 'open') {
      setView('settings')
      const t = setTimeout(() => dismissArtifact(artifact.id), 300)
      return () => clearTimeout(t)
    }
    if (result.setting === 'dnd' && !appliedRef.current) {
      appliedRef.current = true
      setDndAll(true)
      updateArtifact(artifact.id, { data: { ...data, result: { ...result, applied: true } } })
      pushNotification({
        icon: 'notifications_off',
        title: '已开启全局免打扰',
        detail: '所有通知（含 VIP）将暂停推送',
        tone: 'success',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (!data || data.type !== 'setting') return null
  const result = data.result

  if (result.setting === 'open') {
    return (
      <CardFrame
        icon="settings"
        title="系统设置"
        badge="SETTINGS"
        tone="primary"
        onClose={() => dismissArtifact(artifact.id)}
      >
        <div className="intent-card-desc">正在打开系统设置面板…</div>
      </CardFrame>
    )
  }

  return (
    <CardFrame
      icon="notifications_off"
      title="系统设置"
      badge="SETTINGS"
      tone="success"
      onClose={() => dismissArtifact(artifact.id)}
      actions={
        <>
          <CardButton variant="primary" onClick={() => setView('settings')}>
            打开设置
          </CardButton>
          <CardButton onClick={() => dismissArtifact(artifact.id)}>关闭</CardButton>
        </>
      }
    >
      <div className="setting-applied">
        <span className="material-symbols-outlined">check_circle</span>
        <span>{result.label}</span>
      </div>
      <div className="intent-card-desc" style={{ marginTop: 8 }}>
        全局免打扰已生效，所有通知（含 VIP）暂停推送。需要恢复时可在设置里关闭。
      </div>
    </CardFrame>
  )
}
