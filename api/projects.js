// Notion API integration - 🎯 AX DB + 🚀 개인 DB 통합
const DB = {
  axTeam:   '347d7056d19d8172b784dbd0bf1becbd',   // 🎯 AX추진팀 프로젝트 DB (신규, 팀 공유)
  projects: 'd65d7c1584104496aa782401dee7554a',   // 🚀 프로젝트 DB (개인 - AX개인/성당/Creative)
  church:   'dd32bae2171d41babf6491259d63b633',   // 성당 세부
  assets:   '38212f29c4464fdf9192d11d98eaf51f',
}

async function queryDB(dbId, token) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page_size: 100 }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Notion ${res.status} on ${dbId}: ${text}`)
  }
  return res.json()
}

function getTitle(props, key) {
  const p = props[key]
  if (!p || p.type !== 'title') return ''
  return p.title.map(t => t.plain_text).join('')
}
function getSelect(props, key) {
  return props[key]?.select?.name || ''
}
function getText(props, key) {
  const p = props[key]
  if (!p) return ''
  if (p.type === 'rich_text') return p.rich_text.map(t => t.plain_text).join('')
  return ''
}
function getDate(props, key) {
  return props[key]?.date?.start || ''
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')

  const token = process.env.NOTION_TOKEN
  if (!token) return res.status(500).json({ error: 'NOTION_TOKEN not configured' })

  try {
    const [axTeamData, persData, churchData] = await Promise.all([
      queryDB(DB.axTeam, token),
      queryDB(DB.projects, token),
      queryDB(DB.church, token),
    ])

    // --- 🎯 AX팀 프로젝트 DB (팀 공유, 이번주 메인) ---
    const axTeamProjects = axTeamData.results.map(page => {
      const p = page.properties
      const name = getTitle(p, '프로젝트명')
      const 구분 = getSelect(p, '구분')
      const 진행상태 = getSelect(p, '진행상태')

      // 구분별 색상
      let type = 'yellow'
      if (구분 === '개발') type = 'red'
      else if (구분 === '운영') type = 'blue'
      else if (구분 === '지원') type = 'green'

      return {
        id: page.id,
        name,
        assignee: getText(p, '담당자'),
        badge: `${구분} · ${진행상태}`,
        type,
        group: 'ax',
        source: 'team',
        href: page.url,
        due: getText(p, '일정') || '-',
        status: 진행상태,
        구분,
      }
    }).filter(p => p.name && p.status !== '완료')

    // --- 🚀 개인 프로젝트 DB (개인 성당/Creative, AX카테고리는 개인 관리 용도) ---
    const personalProjects = persData.results.map(page => {
      const p = page.properties
      const category = getSelect(p, '카테고리')
      let group = null
      if (category === 'AX팀') group = 'personal-ax'
      else if (category === '성당기획팀') return null
      else if (category === 'AI Creative') group = 'creative'
      if (!group) return null

      const priority = getSelect(p, '우선순위')
      const status = getSelect(p, '상태')
      let type = 'yellow'
      let badge = status
      if (priority === '높음') { type = 'red' }
      else if (priority === '중간') { type = 'yellow' }
      else if (priority === '낮음') { type = 'green' }

      if (group === 'creative') {
        if (status === '제작 중' || status === '진행 중') { type = 'purple'; badge = status }
        else if (status === '기획 중' || status === '아이디어') { type = 'blue'; badge = status }
        else if (status === '완료' || status === '출시') { type = 'green'; badge = status }
      } else if (group === 'personal-ax') {
        if (status === '진행 중') type = 'blue'
        else if (status === '보류') type = 'yellow'
        else if (status === '아이디어') type = 'purple'
      }

      const due = getDate(p, '날짜')
      return {
        id: page.id,
        name: getTitle(p, '프로젝트명'),
        assignee: getText(p, '담당자'),
        badge, type, group,
        source: 'personal',
        href: page.url,
        due: due ? due.replace(/-/g, '.') : '-',
        status,
      }
    }).filter(p => p && p.name && p.status !== '완료' && p.status !== '출시')

    // --- 성당기획팀 세부 프로젝트 DB ---
    const churchProjects = churchData.results.map(page => {
      const p = page.properties
      const status = getSelect(p, '상태')
      return {
        id: page.id,
        name: getTitle(p, '프로젝트명'),
        badge: status,
        type: status === '완료' ? 'green' : 'yellow',
        group: 'church',
        href: page.url,
        due: getDate(p, '날짜').replace(/-/g, '.') || '-',
        status,
      }
    }).filter(c => c.name && c.status !== '완료')

    // 모든 프로젝트 결합
    const allProjects = [...axTeamProjects, ...personalProjects]

    res.status(200).json({
      projects: allProjects,
      churchProjects,
      stats: {
        total: axTeamProjects.length + personalProjects.length + churchProjects.length,
        ax: axTeamProjects.length,
        personalAx: personalProjects.filter(p => p.group === 'personal-ax').length,
        church: churchProjects.length,
        creative: personalProjects.filter(p => p.group === 'creative').length,
      },
    })
  } catch (err) {
    console.error('API Error:', err)
    res.status(500).json({ error: err.message })
  }
}
