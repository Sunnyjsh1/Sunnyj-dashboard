// Weekly Log API - 📝 AX 주간 로그 DB 실시간 조회
const WEEKLY_DB = '347d7056d19d81999185dd1019677bb0'  // 📝 AX 주간 로그
const PROJ_DB = '347d7056d19d8172b784dbd0bf1becbd'    // 🎯 AX추진팀 프로젝트 DB

async function queryDB(dbId, body, token) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || { page_size: 100 }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Notion ${res.status}: ${text}`)
  }
  return res.json()
}

function getTitle(props) {
  for (const key of Object.keys(props)) {
    const p = props[key]
    if (p?.type === 'title') return p.title.map(t => t.plain_text).join('')
  }
  return ''
}
function getSelect(props, key) { return props[key]?.select?.name || '' }
function getText(props, key) {
  const p = props[key]
  if (!p || p.type !== 'rich_text') return ''
  return p.rich_text.map(t => t.plain_text).join('')
}

// "2026년 4월 3W (13-17)" → { year, month, weekN }
function parseWeek(weekStr) {
  const m = /(\d+)년\s*(\d+)월\s*(\d+)W/.exec(weekStr || '')
  return m ? { year: +m[1], month: +m[2], weekN: +m[3], raw: weekStr } : null
}

// 현재 주차 추정 (월별 금요일 기준)
function getCurrentWeek() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  // 해당 월 금요일 리스트
  const fridays = []
  for (let d = 1; d <= 31; d++) {
    const date = new Date(y, m - 1, d)
    if (date.getMonth() + 1 !== m) break
    if (date.getDay() === 5) fridays.push(d)
  }
  // 오늘이 몇 번째 금요일 주에 속하는지 (금 기준, 월~금을 같은 주로)
  const today = now.getDate()
  let weekN = 1
  for (let i = 0; i < fridays.length; i++) {
    if (today <= fridays[i] + 2) { weekN = i + 1; break }  // +2 for 토/일
    if (i === fridays.length - 1) weekN = fridays.length
  }
  const fri = fridays[Math.min(weekN - 1, fridays.length - 1)]
  const mon = fri - 4
  return `${y}년 ${m}월 ${weekN}W (${mon}-${fri})`
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')

  const token = process.env.NOTION_TOKEN
  if (!token) return res.status(500).json({ error: 'NOTION_TOKEN not configured' })

  try {
    // 쿼리 파라미터로 주차 지정 가능, 기본은 현재 주차
    const urlObj = new URL(req.url, `http://${req.headers.host || 'x'}`)
    const queryWeek = urlObj.searchParams.get('week')
    const currentWeek = queryWeek || getCurrentWeek()

    // 프로젝트 메타 + 로그 병렬 조회
    const [projData, logData] = await Promise.all([
      queryDB(PROJ_DB, { page_size: 100 }, token),
      queryDB(WEEKLY_DB, {
        filter: { property: '주차', select: { equals: currentWeek } },
        page_size: 100,
      }, token),
    ])

    // 프로젝트 매핑
    const projMap = {}
    projData.results.forEach(p => {
      projMap[p.id] = {
        name: getTitle(p.properties),
        구분: getSelect(p.properties, '구분'),
        담당자: getText(p.properties, '담당자'),
        진행상태: getSelect(p.properties, '진행상태'),
        url: p.url,
      }
    })

    // 로그 정리
    const entries = logData.results.map(row => {
      const p = row.properties
      const rel = p['프로젝트']?.relation?.[0]
      const proj = rel ? projMap[rel.id] : null
      return {
        id: row.id,
        url: row.url,
        projectName: proj?.name || '(연결 없음)',
        projectUrl: proj?.url || '',
        구분: proj?.구분 || '',
        담당자: proj?.담당자 || '',
        진행상태: proj?.진행상태 || '',
        주차: getSelect(p, '주차'),
        이번주: getText(p, '이번주 내용'),
        차주: getText(p, '차주 예정'),
        작성일: p['작성일']?.date?.start || '',
        작성자: getText(p, '작성자'),
      }
    }).filter(e => e.projectName !== '(연결 없음)')

    // 구분별 그룹핑
    const byGroup = { 운영: [], 지원: [], 개발: [] }
    entries.forEach(e => {
      if (byGroup[e.구분]) byGroup[e.구분].push(e)
    })

    res.status(200).json({
      week: currentWeek,
      entries,
      byGroup,
      count: entries.length,
      debug: { availableWeek: queryWeek ? 'user-specified' : 'auto-current' },
    })
  } catch (err) {
    console.error('Weekly API Error:', err)
    res.status(500).json({ error: err.message })
  }
}
