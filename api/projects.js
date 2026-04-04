const NOTION_TOKEN = process.env.NOTION_TOKEN
const PROJECT_DB = 'd65d7c1584104496aa782401dee7554a'
const CREATIVE_DB = '4508f688830b4c59ba8177c28b7825f0'

async function queryDB(dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page_size: 100 }),
  })
  if (!res.ok) throw new Error(`Notion API error: ${res.status}`)
  return res.json()
}

function getTitle(props, key) {
  const p = props[key]
  if (!p || p.type !== 'title') return ''
  return p.title.map(t => t.plain_text).join('')
}
function getSelect(props, key) {
  const p = props[key]
  return p?.select?.name || ''
}
function getDate(props, key) {
  const p = props[key]
  return p?.date?.start || ''
}
function getText(props, key) {
  const p = props[key]
  if (!p) return ''
  if (p.type === 'rich_text') return p.rich_text.map(t => t.plain_text).join('')
  return ''
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')

  try {
    const [projData, creativeData] = await Promise.all([
      queryDB(PROJECT_DB),
      queryDB(CREATIVE_DB),
    ])

    const projects = projData.results.map(page => {
      const p = page.properties
      const category = getSelect(p, '카테고리')
      let group = 'ax'
      if (category === '성당기획팀') group = 'church'
      else if (category === 'AI Creative') group = 'creative'

      const priority = getSelect(p, '우선순위')
      let type = 'yellow'
      let badge = priority || getSelect(p, '상태')
      if (priority === '높음') { type = 'red'; badge = '🔴 높음' }
      else if (priority === '중간') { type = 'yellow'; badge = '🟡 중간' }
      else if (priority === '낮음') { type = 'green'; badge = '🟢 낮음' }

      const due = getDate(p, '마감일')
      return {
        id: page.id,
        name: getTitle(p, '프로젝트명'),
        badge,
        type,
        href: page.url,
        group,
        due: due ? due.replace(/-/g, '.') : '-',
        status: getSelect(p, '상태'),
      }
    }).filter(p => p.name && p.status !== '완료')

    const creatives = creativeData.results.map(page => {
      const p = page.properties
      const status = getSelect(p, '상태')
      let type = 'yellow'
      if (status === '제작 중') type = 'purple'
      else if (status === '기획 중') type = 'blue'
      else if (status === '완료' || status === '출시') type = 'green'

      const due = getDate(p, '공개일')
      return {
        id: page.id,
        name: getTitle(p, '작품명'),
        badge: status,
        type,
        href: page.url,
        group: 'creative',
        due: due ? due.replace(/-/g, '.') : '미정',
        status,
      }
    }).filter(c => c.name && c.status !== '완료' && c.status !== '출시')

    res.status(200).json({ projects, creatives })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
