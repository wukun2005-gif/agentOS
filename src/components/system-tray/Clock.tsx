import { useEffect, useState } from 'react'

/** 系统托盘时钟 — 每秒刷新（PRD v1.0 §5.1 系统托盘：时间） */
export function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()]

  return (
    <div className="tray-clock">
      <span className="tray-time">
        {hh}:{mm}
      </span>
      <span className="tray-date">
        {now.getMonth() + 1}/{now.getDate()} 周{weekday}
      </span>
    </div>
  )
}
