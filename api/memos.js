// Notion Memo API — GET (목록) / POST (추가) / PATCH (완료 토글) / DELETE (삭제)

const MEMO_DB = process.env.NOTION_MEMO_DB

async function notionFetch(path, method, body, token) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Notion ${res.status}: ${text}`)
  }
  return res.json()
}

function parseMemo(page) {
  const p = page.properties
  return {
    id: page.id,
    text: p['메모']?.title?.map(t => t.plain_text).join('') || '',
    done: p['완료']?.checkbox || false,
    date: p['작성일']?.date?.start || '',
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = process.env.NOTION_TOKEN
  if (!token || !MEMO_DB) {
    return res.status(500).json({ error: 'NOTION_TOKEN or NOTION_MEMO_DB not configured' })
  }

  try {
    // GET — 메모 목록
    if (req.method === 'GET') {
      const data = await notionFetch(`databases/${MEMO_DB}/query`, 'POST', {
        sorts: [{ property: '작성일', direction: 'descending' }],
        page_size: 50,
      }, token)
      const memos = data.results.map(parseMemo)
      return res.status(200).json({ memos })
    }

    // POST — 메모 추가
    if (req.method === 'POST') {
      const { text } = req.body
      if (!text?.trim()) return res.status(400).json({ error: 'text required' })

      const page = await notionFetch('pages', 'POST', {
        parent: { database_id: MEMO_DB },
        properties: {
          '메모': { title: [{ text: { content: text.trim() } }] },
          '완료': { checkbox: false },
          '작성일': { date: { start: new Date().toISOString().slice(0, 10) } },
        },
      }, token)
      return res.status(201).json({ memo: parseMemo(page) })
    }

    // PATCH — 완료 토글
    if (req.method === 'PATCH') {
      const { id, done } = req.body
      if (!id) return res.status(400).json({ error: 'id required' })

      const page = await notionFetch(`pages/${id}`, 'PATCH', {
        properties: {
          '완료': { checkbox: !!done },
        },
      }, token)
      return res.status(200).json({ memo: parseMemo(page) })
    }

    // DELETE — 메모 삭제 (아카이브)
    if (req.method === 'DELETE') {
      const { id } = req.body
      if (!id) return res.status(400).json({ error: 'id required' })

      await notionFetch(`pages/${id}`, 'PATCH', {
        archived: true,
      }, token)
      return res.status(200).json({ ok: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Memo API Error:', err)
    res.status(500).json({ error: err.message })
  }
}
