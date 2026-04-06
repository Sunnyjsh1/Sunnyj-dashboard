// Notion API integration
const DB = {
  projects: 'd65d7c1584104496aa782401dee7554a',
  church:   'dd32bae2171d41babf6491259d63b633',
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
    throw new Error(`Notion ${res.status}: ${text}`)
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
  if (!p) return ""
  if (p.type === "rich_text") return p.rich_text.map(t => t.plain_text).join("")
  return ""
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
    const [projData, churchData] = await Promise.all([
      queryDB(DB.projects, token),
      queryDB(DB.church, token),
    ])

    // --- 프로젝트 DB (AX팀 + AI Creative) ---
    const allProjects = projData.results.map(page => {
      const p = page.properties
      const category = getSelect(p, '카테고리')
      let group = 'ax'
      if (category === 'AI Creative') group = 'creative'
      else if (category === '성당기획팀') return null // 성당기획팀 컨테이너는 제외

      const priority = getSelect(p, '우선순위')
      const status = getSelect(p, '상태')
      let type = 'yellow'
      let badge = status
      if (priority === '높음') { type = 'red' }
      else if (priority === '중간') { type = 'yellow' }
      else if (priority === '낮음') { type = 'green' }

      // AI Creative: 상태별 스타일
      if (group === 'creative') {
        if (status === '제작 중' || status === '진행 중') { type = 'purple'; badge = status }
        else if (status === '기획 중' || status === '아이디어') { type = 'blue'; badge = status }
        else if (status === '완료' || status === '출시') { type = 'green'; badge = status }
      }

      const due = getDate(p, '날짜')
      return {
        id: page.id,
        name: getTitle(p, '프로젝트명'),
        assignee: getText(p, '담당자'),
        badge, type, group,
        href: page.url,
        due: due ? due.replace(/-/g, '.') : '-',
        status,
      }
    }).filter(p => p && p.name)

    const projects = allProjects.filter(p => p.status !== '완료' && p.status !== '출시')

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

    const axCount = projects.filter(p => p.group === 'ax').length
    const churchCount = churchProjects.length
    const creativeCount = projects.filter(p => p.group === 'creative').length

    res.status(200).json({
      projects,
      churchProjects,
      stats: {
        total: axCount + churchCount + creativeCount,
        ax: axCount,
        church: churchCount,
        creative: creativeCount,
      },
    })
  } catch (err) {
    console.error('API Error:', err)
    res.status(500).json({ error: err.message })
  }
}
