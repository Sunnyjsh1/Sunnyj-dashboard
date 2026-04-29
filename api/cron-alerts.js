// Vercel Cron 매일 09:00 KST (UTC 00:00) 실행
// 오늘 요일·날짜·D-Day 기반으로 알림 결정 → Notion 📢 상큼이 알림 DB에 append

const ALERT_DB = '348d7056d19d81d7a6daeb123e39d234'  // 📢 상큼이 알림 DB

// --- Google Calendar ICS 파서 (RFC 5545 최소 구현) ---
function unfoldIcs(text) {
  return text.replace(/\r?\n[ \t]/g, '')
}

// DTSTART → KST 기준 { ymd: 'YYYYMMDD', hm: 'HH:MM' | '종일' }
function dtstartToKst(dtstart) {
  const dm = dtstart.match(/^(\d{4})(\d{2})(\d{2})/)
  if (!dm) return null
  const [, yy, mm, dd] = dm
  const tm = dtstart.match(/T(\d{2})(\d{2})/)
  if (!tm) return { ymd: `${yy}${mm}${dd}`, hm: '종일' }
  const [, h, mn] = tm
  if (dtstart.endsWith('Z')) {
    const utc = Date.UTC(+yy, +mm - 1, +dd, +h, +mn, 0)
    const kst = new Date(utc + 9 * 60 * 60 * 1000)
    const ky = kst.getUTCFullYear()
    const km = String(kst.getUTCMonth() + 1).padStart(2, '0')
    const kd = String(kst.getUTCDate()).padStart(2, '0')
    const kh = String(kst.getUTCHours()).padStart(2, '0')
    const kmn = String(kst.getUTCMinutes()).padStart(2, '0')
    return { ymd: `${ky}${km}${kd}`, hm: `${kh}:${kmn}` }
  }
  return { ymd: `${yy}${mm}${dd}`, hm: `${h}:${mn}` }
}

function parseIcsToday(icsText, todayYmd) {
  const lines = unfoldIcs(icsText).split(/\r?\n/)
  const events = []
  let cur = null
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') cur = {}
    else if (line === 'END:VEVENT') {
      if (cur && cur.dtstart) {
        const k = dtstartToKst(cur.dtstart)
        if (k && k.ymd === todayYmd) {
          cur.kstYmd = k.ymd
          cur.kstHm = k.hm
          events.push(cur)
        }
      }
      cur = null
    } else if (cur) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const keyName = line.slice(0, idx).split(';')[0]
      const value = line.slice(idx + 1)
      if (keyName === 'SUMMARY') cur.summary = value
      else if (keyName === 'DTSTART') cur.dtstart = value
      else if (keyName === 'DTEND') cur.dtend = value
      else if (keyName === 'LOCATION') cur.location = value
    }
  }
  return events.sort((a, b) => (a.kstHm || '').localeCompare(b.kstHm || ''))
}

async function fetchTodayEvents(icalUrl, todayYmd) {
  if (!icalUrl) return []
  try {
    const r = await fetch(icalUrl)
    if (!r.ok) return []
    const text = await r.text()
    return parseIcsToday(text, todayYmd)
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

module.exports = async function handler(req, res) {
  // 보안: Vercel Cron 헤더 검증 (env CRON_SECRET 필요)
  const authHeader = req.headers['authorization']
  const expected = `Bearer ${process.env.CRON_SECRET}`
  const isVercelCron = req.headers['user-agent']?.includes('vercel-cron')

  // 수동 테스트 경로: ?manual=1 쿼리로 인증 우회 (개발용)
  const isManualTest = req.query?.manual === '1'

  if (!isManualTest && authHeader !== expected && !isVercelCron) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const token = process.env.NOTION_TOKEN
  if (!token) return res.status(500).json({ error: 'NOTION_TOKEN missing' })

  // KST 기준 오늘 날짜
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const y = kst.getUTCFullYear()
  const m = kst.getUTCMonth() + 1
  const d = kst.getUTCDate()
  const weekdayIdx = kst.getUTCDay()
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][weekdayIdx]
  const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  // 월말·분기말 판정
  const lastDayOfMonth = new Date(y, m, 0).getDate()
  const isLastFriday = weekday === '금' && d > lastDayOfMonth - 7
  const quarterEndMonths = [3, 6, 9, 12]
  const isQuarterEndLastWeek = quarterEndMonths.includes(m) && d > lastDayOfMonth - 7

  // AI 기본법 D-Day 카운트다운 (2026-01-22)
  const dDay = new Date('2026-01-22T00:00:00+09:00')
  const daysTo = Math.ceil((dDay - kst) / (1000 * 60 * 60 * 24))

  const alerts = []

  // 요일별 알림
  if (weekday === '월') {
    alerts.push({
      title: '📤 월요일 · 주간업무회의록 발송',
      content: '지난주 xlsx 확인 후 손팀장에게 발송하세요. 상큼이한테 "주간업무회의록 xlsx"라고 말하면 최신본 생성.',
      type: '주간업무회의록',
    })
  }
  if (weekday === '목') {
    alerts.push({
      title: '👥 목요일 · 팀 주간회의 10:30',
      content: '팀원 업무 취합 + 새 노션 체계 시연. 회의 후 팀원 안내 메일 발송.',
      type: '기본',
    })
  }
  if (weekday === '금') {
    alerts.push({
      title: '📋 금요일 · 주간 로그 정리 (17:00)',
      content: '팀원 각자 본인 담당 프로젝트 주간 로그 기입. 상큼이한테 "이번주 주간 로그 정리"라고 말하면 자동 취합.',
      type: '주간업무회의록',
    })
  }

  // 월말 마지막 금요일: 법규 체크
  if (isLastFriday) {
    alerts.push({
      title: '⚖️ 월말 · AI 기본법 체크',
      content: 'law.go.kr에서 법률 개정·시행령·고시 업데이트 여부 확인. 변경 있으면 `_knowledge/insights/ai-law-compliance-korea.md` 업데이트 로그에 append.',
      type: '법규 체크',
    })
  }

  // 분기말: 컴플라이언스 재검토
  if (isQuarterEndLastWeek) {
    alerts.push({
      title: '📊 분기말 · 컴플라이언스 재검토',
      content: '13개 AX 프로젝트 컴플라이언스 매트릭스 재검토. 특히 🔴 프로젝트(VS·EZ V2·AI콜센터) 조치 진척도 확인.',
      type: '컴플라이언스',
    })
  }

  // AI 기본법 D-Day 카운트다운
  const ddayMarkers = [180, 90, 60, 30, 14, 7, 3, 1, 0]
  if (ddayMarkers.includes(daysTo)) {
    const msg = daysTo === 0
      ? '🚨 오늘 시행! 전 프로젝트 의무 이행 상태 진입 확인.'
      : daysTo <= 7
        ? `🚨 AI 기본법 시행 ${daysTo}일 전. 최종 이행 상태 확인.`
        : daysTo <= 30
          ? `⏰ AI 기본법 시행 ${daysTo}일 전. 최종 점검 TF 가동.`
          : `📅 AI 기본법 시행 ${daysTo}일 전. 조치 진척 체크.`
    alerts.push({
      title: `⏰ AI 기본법 D-${daysTo}`,
      content: msg,
      type: 'D-Day 카운트다운',
    })
  }

  // Google Calendar 오늘 일정 조회 (업무 + 개인)
  const todayYmd = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`
  const [workEvents, personalEvents] = await Promise.all([
    fetchTodayEvents(process.env.WORK_CALENDAR_ICS_URL, todayYmd),
    fetchTodayEvents(process.env.PERSONAL_CALENDAR_ICS_URL, todayYmd),
  ])
  const calendarEvents = [...workEvents, ...personalEvents]
    .sort((a, b) => (a.kstHm || '').localeCompare(b.kstHm || ''))

  if (calendarEvents.length > 0) {
    const lines = calendarEvents.map(e => {
      const loc = e.location ? ` @ ${e.location}` : ''
      return `• ${e.kstHm} ${e.summary || '(제목 없음)'}${loc}`
    }).join('\n')
    alerts.push({
      title: `📅 ${dateStr} (${weekday}) 오늘 일정 ${calendarEvents.length}건`,
      content: lines,
      type: '캘린더',
    })
  }

  // Daily 기본 알림 (요일/D-Day/캘린더 모두 비었을 때만)
  if (alerts.length === 0) {
    alerts.push({
      title: `☕ ${dateStr} (${weekday}) 좋은 아침`,
      content: '특별 알림 없음. 오늘도 좋은 하루 보내세요.',
      type: '기본',
    })
  }

  // Notion에 알림 append
  const results = []
  for (const a of alerts) {
    try {
      const r = await createAlert(token, a, dateStr)
      results.push(r)
    } catch (err) {
      results.push({ ok: false, title: a.title, error: err.message })
    }
  }

  res.status(200).json({
    date: dateStr,
    weekday,
    dDaysTo: daysTo,
    isLastFriday,
    isQuarterEndLastWeek,
    alertsCreated: alerts.length,
    results,
  })
}
