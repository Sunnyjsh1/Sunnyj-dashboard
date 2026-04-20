// 📢 상큼이 알림 조회 API
// 기본: 오늘 + 미확인 최근 7일 알림 반환

const ALERT_DB = '348d7056d19d81d7a6daeb123e39d234'

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')

  const token = process.env.NOTION_TOKEN
  if (!token) return res.status(500).json({ error: 'NOTION_TOKEN missing' })

  // KST 오늘
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const today = kst.toISOString().slice(0, 10)
  const weekAgo = new Date(kst.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  try {
    const r = await fetch(`https://api.notion.com/v1/databases/${ALERT_DB}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: '알림일', date: { on_or_after: weekAgo } },
          ],
        },
        sorts: [{ property: '알림일', direction: 'descending' }],
        page_size: 30,
      }),
    })
    if (!r.ok) {
      const t = await r.text()
      throw new Error(`Notion ${r.status}: ${t}`)
    }
    const data = await r.json()

    const alerts = data.results.map(row => {
      const p = row.properties
      const title = p['제목']?.title?.map(t => t.plain_text).join('') || ''
      const content = p['내용']?.rich_text?.map(t => t.plain_text).join('') || ''
      const date = p['알림일']?.date?.start || ''
      const type = p['타입']?.select?.name || '기본'
      const status = p['처리상태']?.select?.name || '미확인'
      return {
        id: row.id,
        url: row.url,
        title, content, date, type, status,
        isToday: date === today,
      }
    })

    res.status(200).json({
      today,
      count: alerts.length,
      todayCount: alerts.filter(a => a.isToday).length,
      unreadCount: alerts.filter(a => a.status === '미확인').length,
      alerts,
    })
  } catch (err) {
    console.error('Alerts API Error:', err)
    res.status(500).json({ error: err.message })
  }
}
