// 평일 17:30 KST (UTC 08:30) 실행 — 오늘 마무리 체크 "잔소리 모드"
// 미확인 알림 카운트 기반 따뜻하지만 단호한 메시지를 노션 상큼이 알림 DB에 push

const ALERT_DB = '348d7056d19d81d7a6daeb123e39d234'

async function fetchTodayUnreadAlerts(token, today) {
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
            { property: '알림일', date: { equals: today } },
            { property: '처리상태', select: { equals: '미확인' } },
          ],
        },
        page_size: 30,
      }),
    })
    if (!r.ok) return []
    const data = await r.json()
    return data.results || []
  } catch {
    return []
  }
}

async function createAlert(token, alert, dateStr) {
  const body = {
    parent: { database_id: ALERT_DB },
    properties: {
      '제목': { title: [{ text: { content: alert.title } }] },
      '내용': { rich_text: [{ text: { content: alert.content } }] },
      '알림일': { date: { start: dateStr } },
      '타입': { select: { name: alert.type } },
      '처리상태': { select: { name: '미확인' } },
    }
  }
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return { ok: res.ok, status: res.status, title: alert.title }
}

function pickMessage(unreadCount, weekday) {
  if (unreadCount === 0) {
    const msgs = [
      `🌙 써니팀장님, 오늘 일정 다 마무리하셨네요. 수고 많으셨어요. 내일은 가볍게 시작하세요.`,
      `🌙 ${weekday}요일 마무리 — 미확인 0건. 깔끔합니다. 푹 쉬시고 내일 봐요.`,
    ]
    return msgs[Math.floor(Math.random() * msgs.length)]
  }
  if (unreadCount <= 2) {
    const msgs = [
      `🌙 써니팀장님, 오늘 미확인 알림 ${unreadCount}건 남았어요. 5분만 짬내서 정리하면 내일이 한결 가벼워요.`,
      `🌙 ${weekday}요일 마무리 체크 — 미처리 ${unreadCount}건. 체크하고 퇴근하세요.`,
      `🌙 오늘의 작은 숙제 ${unreadCount}건. 지금 처리하면 침대에서 후회 안 해요.`,
    ]
    return msgs[Math.floor(Math.random() * msgs.length)]
  }
  // 3건 이상 — 단호한 톤
  const msgs = [
    `🌙 써니팀장님, 오늘 미확인 ${unreadCount}건. 다 못해도 괜찮지만 *어떤 게 미뤄졌는지* 만이라도 한 번 보세요.`,
    `🌙 ${weekday}요일 마무리 압박 — ${unreadCount}건 미처리. 우선 1개라도 처리하면 내일 부담이 절반.`,
    `🌙 오늘 ${unreadCount}건 미처리. *완료 가능한 1개만* 골라서 닫아보세요. 시스템이 밀리면 본인이 밀려요.`,
  ]
  return msgs[Math.floor(Math.random() * msgs.length)]
}

module.exports = async function handler(req, res) {
  // 보안: Vercel Cron 헤더 검증
  const authHeader = req.headers['authorization']
  const expected = `Bearer ${process.env.CRON_SECRET}`
  const isVercelCron = req.headers['user-agent']?.includes('vercel-cron')
  const isManualTest = req.query?.manual === '1'

  if (!isManualTest && authHeader !== expected && !isVercelCron) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const token = process.env.NOTION_TOKEN
  if (!token) return res.status(500).json({ error: 'NOTION_TOKEN missing' })

  // KST 기준 오늘
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const y = kst.getUTCFullYear()
  const m = kst.getUTCMonth() + 1
  const d = kst.getUTCDate()
  const weekdayIdx = kst.getUTCDay()
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][weekdayIdx]
  const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  // 주말은 잔소리 안 함 (워라벨 존중)
  if (weekday === '토' || weekday === '일') {
    return res.status(200).json({ skipped: 'weekend', date: dateStr, weekday })
  }

  // 오늘 미확인 알림 조회
  const todayUnread = await fetchTodayUnreadAlerts(token, dateStr)
  const unreadCount = todayUnread.length

  // 잔소리 메시지 선정
  const message = pickMessage(unreadCount, weekday)

  const alert = {
    title: `🌙 ${weekday}요일 · 마무리 체크 (${unreadCount}건)`,
    content: message,
    type: '마무리 체크',
  }

  const result = await createAlert(token, alert, dateStr)

  res.status(200).json({
    date: dateStr,
    weekday,
    unreadCount,
    message,
    result,
  })
}
