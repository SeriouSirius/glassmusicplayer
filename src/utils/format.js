export function formatCount(n) {
  if (!n) return '0'
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿'
  if (n >= 1e4) return (n / 1e4).toFixed(1) + '万'
  return n.toString()
}

export function formatDuration(ms) {
  if (!ms) return '0:00'
  const s = Math.floor(ms / 1000)
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
}

export function formatTime(s) {
  if (!s) return '0:00'
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0')
}

export function highlightText(t, q) {
  if (!q || !t) return t || ''
  const r = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi')
  return t.replace(r, '<span style="color:var(--accent);font-weight:600">$1</span>')
}
