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


const STUDY_PROGRAM = [
  {
    id: 'w1',
    phase: 'W1',
    title: '매트릭스 정련',
    desc: '5/23~5/29 · 4트랙 자가진단 + T3 L단계 확정',
    tasks: [
      '매트릭스 T3 진단 완료',
      'RAG 기초 1편',
      '백로그 시드 1개',
      '금: W1 회고',
    ],
  },
  {
    id: 'w2',
    phase: 'W2 ★',
    title: 'LLM 평가 메트릭',
    desc: '5/30~6/5 · 현재 진행 중',
    tasks: [
      'T3 월·수: LLM 평가 메트릭 (Hallucination·LLM-as-judge)',
      'T3: 매트릭스 갱신',
      'T4 화·목: 백로그 1순위 착수',
      '금: W2 회고',
    ],
  },
  {
    id: 'w3',
    phase: 'W3',
    title: 'VS·CQI 매핑 + 에이전트 패턴',
    desc: '6/6~6/12 · 구 12주 W1-2·W3-4 통합',
    tasks: [
      'T3 월: VS·CQI 평가체계 매핑',
      'T3 수: Anthropic 에이전트 패턴 정독',
      'T4 화·목: 백로그 중반',
      '금: W3 회고',
    ],
  },
  {
    id: 'w4',
    phase: 'W4',
    title: 'Failure Mode + 중간점검',
    desc: '6/13~6/19 · 구 12주 W5-6 통합',
    tasks: [
      'T3 월: Failure Mode 카탈로그',
      'T3 수: L단계 중간 검증',
      'T4 화·목: 백로그 완주',
      '금: 중간 회고',
    ],
  },
  {
    id: 'w5',
    phase: 'W5',
    title: 'PE 자산화 + 직접 실험',
    desc: '6/20~6/26 · 구 12주 W7-8 통합',
    tasks: [
      'T3 월: Prompt Engineering 자산화',
      'T3 수: 직접 실험 (RAG 또는 평가 셋업)',
      'T4 화·목: 백로그 2개째',
      '금: W5 회고',
    ],
  },
  {
    id: 'w6',
    phase: 'W6',
    title: '산출물 통합',
    desc: '6/27~7/3 · 구 12주 W9-10 통합',
    tasks: [
      'T3 월: 개발 협업 어휘 실습',
      'T3 수: 산출물 통합 (뉴스레터·사내교육)',
      'T4 화·목: portfolio 정리',
      '금: 최종 회고 + 7월 방향 결정',
    ],
  },
  {
    id: 'w7plus',
    phase: '7월~',
    title: 'MLOps 기본',
    desc: '7/4~ · 구 12주 W11-12 통합',
    tasks: [
      'MLOps 사이클 정독',
      'AX 협업 SOP 반영',
      'AX팀 표준 1장',
    ],
  },
]

function StudyProgram() {
  const [expanded, setExpanded] = useState(() => {
    try { const s = localStorage.getItem('studyProgramExpanded'); return s === null ? true : s === 'true' } catch { return true }
  })
  const [checks, setChecks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('studyChecks') || '{}') } catch { return {} }
  })
  const [notionUrls, setNotionUrls] = useState(() => {
    try { return JSON.parse(localStorage.getItem('studyNotionUrls') || '{}') } catch { return {} }
  })
  const [masterUrl, setMasterUrl] = useState(() => {
    try { return localStorage.getItem('studyMasterNotion') || '' } catch { return '' }
  })
  const [editingUrls, setEditingUrls] = useState(false)

  function toggleExpand() {
    const next = !expanded
    setExpanded(next)
    try { localStorage.setItem('studyProgramExpanded', String(next)) } catch {}
  }
  function toggleCheck(key) {
    const next = { ...checks, [key]: !checks[key] }
    setChecks(next)
    try { localStorage.setItem('studyChecks', JSON.stringify(next)) } catch {}
  }
  function updateNotionUrl(id, url) {
    const next = { ...notionUrls, [id]: url }
    setNotionUrls(next)
    try { localStorage.setItem('studyNotionUrls', JSON.stringify(next)) } catch {}
  }
  function updateMasterUrl(url) {
    setMasterUrl(url)
    try { localStorage.setItem('studyMasterNotion', url) } catch {}
  }

  const totalTasks = STUDY_PROGRAM.reduce((acc, p) => acc + p.tasks.length, 0)
  const doneTasks = STUDY_PROGRAM.reduce((acc, p) => acc + p.tasks.filter((_, i) => checks[`${p.id}:${i}`]).length, 0)
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className={`${styles.card} ${styles.studyCard}`}>
      <div className={styles.studyHeaderRow}>
        <div className={styles.studyTitleBlock}>
          <div className={styles.cardLabel} style={{ marginBottom: 2 }}>📚 Mastery 6주 커리큘럼</div>
          <div className={styles.studySubtitle}>T3(AX기술) + T4(개발백로그) · 2h/일 평일 · ~7/3</div>
        </div>
        <div className={styles.studyHeaderRight}>
          {masterUrl && (
            <a href={masterUrl} target="_blank" rel="noreferrer" className={styles.studyMasterBtn}>📝 노션 메인</a>
          )}
          <button className={styles.cheatToggle} onClick={() => setEditingUrls(!editingUrls)}>
            {editingUrls ? '완료' : 'URL 편집'}
          </button>
          <button className={styles.cheatToggle} onClick={toggleExpand}>
            {expanded ? '접기 ▲' : '펼치기 ▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          <div className={styles.studyProgressRow}>
            <div className={styles.studyProgressBar}>
              <div className={styles.studyProgressFill} style={{ width: `${progress}%` }}></div>
            </div>
            <span className={styles.studyProgressText}>{doneTasks} / {totalTasks} ({progress}%)</span>
          </div>

          {editingUrls && (
            <input
              className={styles.studyMasterUrlInput}
              type="text"
              placeholder="📝 노션 메인 페이지 URL (예: https://www.notion.so/...)"
              value={masterUrl}
              onChange={e => updateMasterUrl(e.target.value)}
            />
          )}

          <div className={styles.studyPhases}>
            {STUDY_PROGRAM.map(phase => (
              <div key={phase.id} className={styles.studyPhase}>
                <div className={styles.studyPhaseHeader}>
                  <span className={styles.studyPhaseLabel}>{phase.phase}</span>
                  <span className={styles.studyPhaseTitle}>{phase.title}</span>
                  {notionUrls[phase.id] && (
                    <a href={notionUrls[phase.id]} target="_blank" rel="noreferrer" className={styles.studyPhaseLink} title="노션 페이지">📝</a>
                  )}
                </div>
                <div className={styles.studyPhaseDesc}>{phase.desc}</div>
                {editingUrls && (
                  <input
                    className={styles.studyPhaseUrlInput}
                    type="text"
                    placeholder={`${phase.phase} 노션 페이지 URL`}
                    value={notionUrls[phase.id] || ''}
                    onChange={e => updateNotionUrl(phase.id, e.target.value)}
                  />
                )}
                <ul className={styles.studyTasks}>
                  {phase.tasks.map((task, i) => {
                    const key = `${phase.id}:${i}`
                    const done = !!checks[key]
                    return (
                      <li key={key}>
                        <label className={styles.studyTaskLabel}>
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={() => toggleCheck(key)}
                            className={styles.studyTaskCheck}
                          />
                          <span className={done ? styles.studyTaskDone : styles.studyTaskText}>{task}</span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function CalendarCard({ items }) {
  const [expanded, setExpanded] = useState(() => {
    try { const s = localStorage.getItem('calendarExpanded'); return s === null ? true : s === 'true' } catch { return true }
  })
  function toggle() {
    const next = !expanded
    setExpanded(next)
    try { localStorage.setItem('calendarExpanded', String(next)) } catch {}
  }
  const totalCount = items.reduce((sum, item) => {
    const m = (item.title || '').match(/(\d+)건/)
    return sum + (m ? parseInt(m[1]) : 0)
  }, 0)

  return (
    <div className={`${styles.card} ${styles.calendarCard}`}>
      <div className={styles.calendarHeaderRow}>
        <div className={styles.cardLabel} style={{ marginBottom: 0 }}>
          📅 오늘 캘린더 일정 {totalCount > 0 ? `(${totalCount}건)` : ''}
        </div>
        <button className={styles.cheatToggle} onClick={toggle}>
          {expanded ? '접기 ▲' : '펼치기 ▼'}
        </button>
      </div>
      {expanded && (
        <div className={styles.calendarBody}>
          {items.map(item => {
            const lines = (item.content || '').split('\n').filter(l => l.trim())
            return (
              <div key={item.id} className={styles.calendarItemBlock}>
                <div className={styles.calendarItemTitle}>{item.title}</div>
                {lines.map((line, i) => (
                  <div key={i} className={styles.calendarLine}>{line}</div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const FOCUS_FOUR = [
  { name: 'Virtual Sapiens', status: 'Sprint 1', type: 'red', href: 'https://www.notion.so/d65d7c1584104496aa782401dee7554a' },
  { name: 'EZ Interview V2', status: 'AI 모더레이터 고도화', type: 'red', href: 'https://www.notion.so/d65d7c1584104496aa782401dee7554a' },
  { name: 'CQI V5', status: 'V5 본평가 준비', type: 'yellow', href: 'https://www.notion.so/d65d7c1584104496aa782401dee7554a' },
  { name: 'AI 뉴스레터', status: '정기 발행', type: 'green', href: 'https://www.notion.so/d65d7c1584104496aa782401dee7554a' },
]

function FocusFour() {
  return (
    <Card title="🎯 4대 집중">
      <div className={styles.focusGrid}>
        {FOCUS_FOUR.map(p => (
          <a key={p.name} className={styles.focusItem} href={p.href} target="_blank" rel="noreferrer">
            <span className={styles.focusName}>{p.name}</span>
            <Badge type={p.type}>{p.status}</Badge>
          </a>
        ))}
      </div>
    </Card>
  )
}

function TodayFocus() {
  const [focus, setFocus] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('todayFocus') || '{}')
      const today = new Date().toDateString()
      return saved.date === today ? saved.text : ''
    } catch { return '' }
  })
  function save(text) {
    setFocus(text)
    try { localStorage.setItem('todayFocus', JSON.stringify({ text, date: new Date().toDateString() })) } catch {}
  }
  return (
    <div className={styles.focusBar}>
      <span className={styles.focusBarLabel}>⚡ 오늘의 포커스</span>
      <input
        className={styles.focusBarInput}
        type="text"
        placeholder="오늘 가장 중요한 한 가지..."
        value={focus}
        onChange={e => save(e.target.value)}
      />
    </div>
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

        <TodayFocus />

        {/* 📢 상큼이 알림 (완료·캘린더 자동 제외 — 캘린더는 별도 카드) */}
        {(() => {
          const visible = alerts?.alerts?.filter(a => a.status !== '완료' && a.type !== '캘린더') || []
          if (visible.length === 0) return null
          return (
            <Card title={`📢 상큼이 알림 — ${alerts?.unreadCount > 0 ? `미확인 ${alerts.unreadCount}개` : '모두 확인'}`}>
              {visible.slice(0, 5).map(a => {
                const typeColor = {
                  '주간업무회의록': '#DBEAFE',
                  '주간보고': '#DBEAFE',
                  'daily 기록': '#DCFCE7',
                  '법규 체크': '#FEE2E2',
                  '컴플라이언스': '#FED7AA',
                  'D-Day 카운트다운': '#FBCFE8',
                  '기본': '#F1F5F9',
                }[a.type] || '#F1F5F9'
                return (
                  <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className={styles.prow}
                     style={{ display: 'block', padding: '8px', borderLeft: `4px solid ${typeColor}`, marginBottom: 4, textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontWeight: a.isToday ? 600 : 400, fontSize: 13 }}>
                      {a.isToday && '⭐ '}{a.title}
                      <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>[{a.type}] {a.date}</span>
                    </div>
                    {a.content && <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{a.content}</div>}
                  </a>
                )
              })}
              {visible.length > 5 && (
                <div style={{ fontSize: 11, color: '#64748b', textAlign: 'right', marginTop: 4 }}>
                  {visible.length - 5}개 더... (노션에서 전체 확인)
                </div>
              )}
            </Card>
          )
        })()}

        {/* 📅 오늘 캘린더 일정 (접기 가능) */}
        {(() => {
          const calItems = alerts?.alerts?.filter(a => a.type === '캘린더' && a.status !== '완료') || []
          if (calItems.length === 0) return null
          return <CalendarCard items={calItems} />
        })()}

        <FocusFour />

        {/* 📚 Mastery 6주 커리큘럼 */}
        <StudyProgram />


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

      </div>
    </div>
  )
}
