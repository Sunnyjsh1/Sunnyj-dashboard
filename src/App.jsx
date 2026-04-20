import React, { useState, useEffect } from 'react'
import styles from './App.module.css'

const NOTION = {
  projects:   'https://www.notion.so/d65d7c1584104496aa782401dee7554a',
  aiAssets:   'https://www.notion.so/38212f29c4464fdf9192d11d98eaf51f',
  teamOps:    'https://www.notion.so/338d7056d19d81e6a924e8ddbbdad845',

  churchPage: 'https://www.notion.so/338d7056d19d818a99dfe3c534530dcc',

}

const CAL_URL =
  'https://calendar.google.com/calendar/embed' +
  '?src=sunnyj%40embrain.com' +
  '&src=suniscool%40gmail.com' +
  '&src=5bf67919e35ab32990af7f870f634fda881abe61b54242735ce8edaa56a9c9f0%40group.calendar.google.com' +
  '&ctz=Asia%2FSeoul&mode=WEEK&showTitle=0&showNav=1&showDate=1' +
  '&showPrint=0&showTabs=0&showCalendars=1&hl=ko'

function Badge({ type, children }) {
  const map = {
    red:    { bg: '#FEE2E2', color: '#B91C1C' },
    yellow: { bg: '#FEF9C3', color: '#92400E' },
    purple: { bg: '#EDE9FE', color: '#5B21B6' },
    blue:   { bg: '#DBEAFE', color: '#1E40AF' },
    green:  { bg: '#DCFCE7', color: '#14532D' },
  }
  const s = map[type] || map.yellow
  return (
    <span className={styles.badge} style={{ background: s.bg, color: s.color }}>
      {children}
    </span>
  )
}

function ProjectRow({ href, name, badge, type, due }) {
  return (
    <a className={styles.prow} href={href} target="_blank" rel="noreferrer">
      <span className={styles.prowName}>{name}</span>
      <span className={styles.prowDue}>{due}</span>
      <Badge type={type}>{badge}</Badge>
    </a>
  )
}

function Card({ title, children, className = '' }) {
  return (
    <div className={`${styles.card} ${className}`}>
      {title && <div className={styles.cardLabel}>{title}</div>}
      {children}
    </div>
  )
}

function QuickBtn({ href, children }) {
  return (
    <a className={styles.quickBtn} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

const DEFAULT_AI_TOOLS = [
  { label: '✦ Gemini', href: 'https://gemini.google.com/' },
  { label: '✸ Claude', href: 'https://claude.ai/' },
  { label: '◎ GPT 4.0', href: 'https://chatgpt.com/' },
  { label: '📓 노트북LM', href: 'https://notebooklm.google.com/' },
  { label: '🎬 구글AI스튜디오', href: 'https://aistudio.google.com/' },
  { label: '⚡ 젠스파크', href: 'https://www.genspark.ai/' },
  { label: '🎨 CANVA', href: 'https://www.canva.com/' },
  { label: '📊 감마', href: 'https://gamma.app/' },
  { label: '📝 노션', href: 'https://www.notion.so/' },
  { label: '🧠 AI프롬프트 고급', href: 'https://www.promptingguide.ai/' },
]

function loadAiTools() {
  try {
    const saved = localStorage.getItem('aiTools')
    return saved ? JSON.parse(saved) : DEFAULT_AI_TOOLS
  } catch { return DEFAULT_AI_TOOLS }
}
function saveAiTools(tools) {
  localStorage.setItem('aiTools', JSON.stringify(tools))
}

const QUICK_LINKS = [
  { label: '🚀 프로젝트', href: NOTION.projects },
  { label: '📚 Asset', href: NOTION.aiAssets },
  { label: '👥 Team', href: NOTION.teamOps },
  { label: '📧 하이웍스 메일', href: 'https://dashboard.office.hiworks.com/' },
  { label: '🤖 AI게시판', href: 'https://kp.embrain.com/search/loginpage.do' },
  { label: '🤖 AI게시판(관리)', href: 'https://kpad.embrain.com/search/adminProposal.do' },
  { label: '📋 프로젝트 보드', href: 'https://project-8jsar.vercel.app/' },
]

const FALLBACK_PROJECTS = [
  { name: 'EZ Interview AI 모더레이터', badge: '🔴 높음', type: 'red', href: NOTION.ezInterview, group: 'ax', due: '-' },
  { name: '합성패널', badge: '🔴 높음', type: 'red', href: NOTION.synth, group: 'ax', due: '-' },
  { name: 'AI 모더레이터 고도화', badge: '🟡 중간', type: 'yellow', href: NOTION.aiMod, group: 'ax', due: '-' },
  { name: '업무자동화', badge: '🟡 중간', type: 'yellow', href: NOTION.automate, group: 'ax', due: '-' },
  { name: '동호회', badge: '진행 중', type: 'yellow', href: 'https://www.notion.so/338d7056d19d810b86bff026ff96b35f', group: 'church', due: '-' },
  { name: '신자노트 제작', badge: '진행 중', type: 'yellow', href: 'https://www.notion.so/338d7056d19d814e999ff1164953fe8b', group: 'church', due: '-' },
  { name: '성경 출판', badge: '진행 중', type: 'yellow', href: 'https://www.notion.so/338d7056d19d81f9be6fd5a9eb716535', group: 'church', due: '-' },
  { name: '사진자료 아카이브 구축', badge: '진행 중', type: 'yellow', href: 'https://www.notion.so/338d7056d19d81fcaadad8a15375f187', group: 'church', due: '-' },
  { name: 'WYD (세계청년대회)', badge: '진행 중', type: 'yellow', href: 'https://www.notion.so/338d7056d19d81848126c4e16806f56f', group: 'church', due: '-' },
  { name: 'WALK (산책)', badge: '제작 중', type: 'purple', href: NOTION.walk, group: 'creative', due: '미정' },
  { name: 'MAZU: THE GREAT WORK', badge: '기획 중', type: 'blue', href: NOTION.mazu, group: 'creative', due: '미정' },
]

export default function App() {
  const [dateStr, setDateStr] = useState('')
  const [query, setQuery] = useState('')
  const [allProjects, setAllProjects] = useState(FALLBACK_PROJECTS)
  const [aiTools, setAiTools] = useState(loadAiTools)
  const [editMode, setEditMode] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newHref, setNewHref] = useState('')
  const [memos, setMemos] = useState([])
  const [memoText, setMemoText] = useState('')
  const [memoLoading, setMemoLoading] = useState(false)
  const [weekly, setWeekly] = useState(null)
  const [alerts, setAlerts] = useState(null)

  function addTool() {
    if (!newLabel.trim() || !newHref.trim()) return
    const updated = [...aiTools, { label: newLabel.trim(), href: newHref.trim() }]
    setAiTools(updated)
    saveAiTools(updated)
    setNewLabel('')
    setNewHref('')
  }
  function removeTool(idx) {
    const updated = aiTools.filter((_, i) => i !== idx)
    setAiTools(updated)
    saveAiTools(updated)
  }

  useEffect(() => {
    const d = new Date()
    const days = ['일','월','화','수','목','금','토']
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    setDateStr(`${y}.${m}.${day} (${days[d.getDay()]})`)
  }, [])

  // 메모 로드
  useEffect(() => {
    fetch('/api/memos')
      .then(r => r.json())
      .then(data => { if (data.memos) setMemos(data.memos) })
      .catch(() => {})
  }, [])

  function addMemo() {
    if (!memoText.trim() || memoLoading) return
    setMemoLoading(true)
    fetch('/api/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: memoText.trim() }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.memo) setMemos(prev => [data.memo, ...prev])
        setMemoText('')
      })
      .catch(() => {})
      .finally(() => setMemoLoading(false))
  }

  function toggleMemo(id, currentDone) {
    fetch('/api/memos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, done: !currentDone }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.memo) setMemos(prev => prev.map(m => m.id === id ? data.memo : m))
      })
      .catch(() => {})
  }

  function deleteMemo(id) {
    fetch('/api/memos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
      .then(r => r.json())
      .then(() => setMemos(prev => prev.filter(m => m.id !== id)))
      .catch(() => {})
  }

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => {
        const merged = [...(data.projects || []), ...(data.churchProjects || [])]
        if (merged.length > 0) setAllProjects(merged)
      })
      .catch(() => {})
  }, [])

  // 이번주 진행사항 로드
  useEffect(() => {
    fetch('/api/weekly')
      .then(r => r.json())
      .then(data => { if (data.entries) setWeekly(data) })
      .catch(() => {})
  }, [])

  // 📢 상큼이 알림 로드
  useEffect(() => {
    fetch('/api/alerts')
      .then(r => r.json())
      .then(data => { if (data.alerts) setAlerts(data) })
      .catch(() => {})
  }, [])

  const q = query.trim().toLowerCase()
  const filteredLinks = q ? QUICK_LINKS.filter(l => l.label.toLowerCase().includes(q)) : QUICK_LINKS
  const filteredProjects = q ? allProjects.filter(p => p.name.toLowerCase().includes(q) || p.badge.includes(q)) : allProjects
  const axProjects = filteredProjects.filter(p => p.group === 'ax')
  const personalAxProjects = filteredProjects.filter(p => p.group === 'personal-ax')
  const churchProjects = filteredProjects.filter(p => p.group === 'church')
  const creativeProjects = filteredProjects.filter(p => p.group === 'creative')

  return (
    <div className={styles.page}>
      {/* 왼쪽 사이드바 — 빠른 이동 */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>⚡ 빠른 이동</div>
        <nav className={styles.sidebarNav}>
          {filteredLinks.map(l => (
            <QuickBtn key={l.href} href={l.href}>{l.label}</QuickBtn>
          ))}
          {q && filteredLinks.length === 0 && (
            <div className={styles.noResult}>결과 없음</div>
          )}
        </nav>

        <div className={styles.sidebarDivider} />

        <div className={styles.sidebarTitleRow}>
          <div className={styles.sidebarTitle}>🛠 AI 도구</div>
          <button className={styles.editToggle} onClick={() => setEditMode(!editMode)}>
            {editMode ? '완료' : '편집'}
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {aiTools.map((t, i) => (
            <div key={i} className={styles.toolRow}>
              <a className={styles.quickBtn} href={t.href} target="_blank" rel="noreferrer">{t.label}</a>
              {editMode && (
                <button className={styles.removeBtn} onClick={() => removeTool(i)}>✕</button>
              )}
            </div>
          ))}
          {editMode && (
            <div className={styles.addForm}>
              <input
                className={styles.addInput}
                placeholder="이름"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
              />
              <input
                className={styles.addInput}
                placeholder="URL"
                value={newHref}
                onChange={e => setNewHref(e.target.value)}
              />
              <button className={styles.addBtn} onClick={addTool}>추가</button>
            </div>
          )}
        </nav>
      </aside>

      {/* 오른쪽 메인 콘텐츠 */}
      <div className={styles.main}>
        {/* 헤더 */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.h1}>📊 전체 업무 현황</h1>
            <p className={styles.sub}>써니제이 전용 · 매일 아침 여기서 시작하세요</p>
          </div>
          <span className={styles.dateChip}>{dateStr}</span>
        </header>

        {/* 검색 */}
        <div className={styles.searchWrap}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="🔍 프로젝트·링크 검색..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className={styles.searchClear} onClick={() => setQuery('')}>✕</button>
          )}
        </div>

        {/* 📢 상큼이 알림 (최상단) */}
        {alerts && alerts.alerts && alerts.alerts.length > 0 && (
          <Card title={`📢 상큼이 알림 — ${alerts.unreadCount > 0 ? `미확인 ${alerts.unreadCount}개` : '모두 확인'}`}>
            {alerts.alerts.slice(0, 5).map(a => {
              const typeColor = {
                '주간보고': '#DBEAFE',
                'daily 기록': '#DCFCE7',
                '법규 체크': '#FEE2E2',
                '컴플라이언스': '#FED7AA',
                'D-Day 카운트다운': '#FBCFE8',
                '기본': '#F1F5F9',
              }[a.type] || '#F1F5F9'
              return (
                <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className={styles.prow}
                   style={{ display: 'block', padding: '8px', borderLeft: `4px solid ${typeColor}`, marginBottom: 4, textDecoration: 'none', color: 'inherit', opacity: a.status === '완료' ? 0.5 : 1 }}>
                  <div style={{ fontWeight: a.isToday ? 600 : 400, fontSize: 13 }}>
                    {a.isToday && '⭐ '}{a.title}
                    <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>[{a.type}] {a.date}</span>
                  </div>
                  {a.content && <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{a.content}</div>}
                </a>
              )
            })}
            {alerts.alerts.length > 5 && (
              <div style={{ fontSize: 11, color: '#64748b', textAlign: 'right', marginTop: 4 }}>
                {alerts.alerts.length - 5}개 더... (노션에서 전체 확인)
              </div>
            )}
          </Card>
        )}

        {/* 숫자 카드 */}
        <div className={styles.cols2}>
          <Card title="진행 중 프로젝트">
            <div className={styles.stat}>{filteredProjects.length}</div>
            <div className={styles.statSub}>AX팀 {axProjects.length} · 개인AX {personalAxProjects.length} · 성당 {churchProjects.length} · Creative {creativeProjects.length}</div>
          </Card>

          <Card title="완료된 프로젝트">
            <div className={styles.stat}>2</div>
            <div className={styles.statSub}>사진 아카이브 · AI 전자책</div>
          </Card>
        </div>

        {/* 📅 이번주 진행사항 (신규, 최상단 우선 표시) */}
        {weekly && weekly.entries && weekly.entries.length > 0 && (
          <Card title={`📅 이번주 진행사항 — ${weekly.week}`} className={styles.weeklyCard}>
            {['운영', '지원', '개발'].map(cat => {
              const items = weekly.byGroup?.[cat] || []
              if (items.length === 0) return null
              const catEmoji = { '운영': '🛠', '지원': '🔗', '개발': '🚀' }[cat]
              return (
                <div key={cat} style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#475569', margin: '6px 0' }}>
                    {catEmoji} {cat} ({items.length})
                  </div>
                  {items.map(e => (
                    <a key={e.id} href={e.projectUrl || e.url} target="_blank" rel="noreferrer"
                       className={styles.prow} style={{ display: 'block', padding: '6px 8px' }}>
                      <div style={{ fontWeight: 500 }}>{e.projectName}
                        {e.담당자 && <span style={{ color: '#64748b', fontWeight: 400, fontSize: 12 }}> · {e.담당자}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'pre-line', marginTop: 2 }}>
                        {e.이번주.split('\n').slice(0, 3).join('\n')}
                        {e.이번주.split('\n').length > 3 && '...'}
                      </div>
                    </a>
                  ))}
                </div>
              )
            })}
          </Card>
        )}

        {/* 프로젝트 현황 */}
        <div className={styles.cols3}>
          <Card title="🎯 AX팀 프로젝트">
            {axProjects.length > 0 ? axProjects.map(p => (
              <ProjectRow key={p.href} href={p.href} name={p.assignee ? p.name + ' (' + p.assignee + ')' : p.name} badge={p.badge} type={p.type} due={p.due} />
            )) : <div className={styles.noResult}>검색 결과 없음</div>}
            {personalAxProjects.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '10px 0 4px', borderTop: '1px dashed #cbd5e1', paddingTop: 8 }}>
                  🛠 개인 관리
                </div>
                {personalAxProjects.map(p => (
                  <ProjectRow key={p.href} href={p.href} name={p.name} badge={p.badge} type={p.type} due={p.due} />
                ))}
              </>
            )}
            <a className={styles.moreLink} href={NOTION.projects} target="_blank" rel="noreferrer">
              전체 프로젝트 DB →
            </a>
          </Card>

          <Card title="⛪ 성당 기획팀">
            {churchProjects.length > 0 ? churchProjects.map(p => (
              <ProjectRow key={p.href} href={p.href} name={p.name} badge={p.badge} type={p.type} due={p.due} />
            )) : <div className={styles.noResult}>검색 결과 없음</div>}
          
            <a className={styles.moreLink} href="https://docs.google.com/spreadsheets/d/18A5JqnsKd4j6wCCtrHZEkKl11NYb2xpKRH13PfzgNF4/edit?gid=0#gid=0" target="_blank" rel="noreferrer">
              📋 월별보고 →
            </a>
          </Card>

          <Card title="🎬 AI Creative">
            {creativeProjects.length > 0 ? creativeProjects.map(p => (
              <ProjectRow key={p.href} href={p.href} name={p.name} badge={p.badge} type={p.type} due={p.due} />
            )) : <div className={styles.noResult}>검색 결과 없음</div>}
          
            <a className={styles.moreLink} href={NOTION.projects} target="_blank" rel="noreferrer">
              전체 프로젝트 DB →
            </a>
          </Card>
        </div>

        {/* 메모 */}
        <Card title="📝 메모" className={styles.memoCard}>
          <div className={styles.memoInput}>
            <input
              className={styles.memoField}
              type="text"
              placeholder="메모 입력..."
              value={memoText}
              onChange={e => setMemoText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addMemo() }}
              disabled={memoLoading}
            />
            <button className={styles.memoAddBtn} onClick={addMemo} disabled={memoLoading}>
              {memoLoading ? '...' : '추가'}
            </button>
          </div>
          <div className={styles.memoList}>
            {memos.length === 0 && <div className={styles.noResult}>메모가 없습니다</div>}
            {memos.map(m => (
              <div key={m.id} className={`${styles.memoItem} ${m.done ? styles.memoDone : ''}`}>
                <button className={styles.memoCheck} onClick={() => toggleMemo(m.id, m.done)}>
                  {m.done ? '✅' : '☐'}
                </button>
                <span className={styles.memoText}>{m.text}</span>
                <span className={styles.memoDate}>{m.date}</span>
                <button className={styles.memoDelete} onClick={() => deleteMemo(m.id)}>✕</button>
              </div>
            ))}
          </div>
        </Card>

        {/* 캘린더 */}
        <Card title="📅 일정 (Google Calendar)">
          <iframe
            className={styles.calFrame}
            src={CAL_URL}
            frameBorder="0"
            scrolling="no"
            title="Google Calendar"
          />
        </Card>
      </div>
    </div>
  )
}
