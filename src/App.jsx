import React, { useState, useEffect } from 'react'
import styles from './App.module.css'

const NOTION = {
  projects:   'https://www.notion.so/d65d7c1584104496aa782401dee7554a',
  axTeam:     'https://www.notion.so/338d7056d19d81efaa3fe9be70900610',
  aiAssets:   'https://www.notion.so/338d7056d19d81da8434c26d1ba4a501',
  education:  'https://www.notion.so/b29e69c05c6f4a86b8bef53b92a3e106',
  axSupport:  'https://www.notion.so/77a5b37cefa0454d9fc83996f186351a',
  teamOps:    'https://www.notion.so/338d7056d19d81e6a924e8ddbbdad845',
  creative:   'https://www.notion.so/4508f688830b4c59ba8177c28b7825f0',
  church:     'https://www.notion.so/338d7056d19d8164b925c6a069a3c7c8',
  guide:      'https://www.notion.so/338d7056d19d81eab55deb2b53170aa1',
  churchPage: 'https://www.notion.so/338d7056d19d818a99dfe3c534530dcc',
  ezInterview:'https://www.notion.so/338d7056d19d81dd886bc228847e097a',
  synth:      'https://www.notion.so/338d7056d19d81acad2aca71f03ac7f1',
  aiMod:      'https://www.notion.so/338d7056d19d81e3877fd9da9b4e1c2f',
  automate:   'https://www.notion.so/338d7056d19d816194ccec41be06efb0',
  club:       'https://www.notion.so/338d7056d19d812f9b7ff39caf646fbb',
  note:       'https://www.notion.so/338d7056d19d814e999ff1164953fe8b',
  bible:      'https://www.notion.so/338d7056d19d81f9be6fd5a9eb716535',
  walk:       'https://www.notion.so/338d7056d19d8135b28de9b187e32f2b',
  mazu:       'https://www.notion.so/338d7056d19d81c0a294fe619461c1e4',
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
  { label: '🚀 전체 프로젝트', href: NOTION.projects },
  { label: '📚 AI Assets DB', href: NOTION.aiAssets },
  { label: '👥 팀 운영', href: NOTION.teamOps },
  { label: '📘 운영가이드', href: NOTION.guide },
  { label: '📧 하이웍스 메일', href: 'https://dashboard.office.hiworks.com/' },
  { label: '🤖 AI게시판', href: 'https://kp.embrain.com/search/loginpage.do' },
  { label: '🤖 AI게시판(관리)', href: 'https://kpad.embrain.com/search/adminProposal.do' },
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

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => {
        const merged = [...(data.projects || []), ...(data.churchProjects || [])]
        if (merged.length > 0) setAllProjects(merged)
      })
      .catch(() => {})
  }, [])

  const q = query.trim().toLowerCase()
  const filteredLinks = q ? QUICK_LINKS.filter(l => l.label.toLowerCase().includes(q)) : QUICK_LINKS
  const filteredProjects = q ? allProjects.filter(p => p.name.toLowerCase().includes(q) || p.badge.includes(q)) : allProjects
  const axProjects = filteredProjects.filter(p => p.group === 'ax')
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

        {/* 숫자 카드 */}
        <div className={styles.cols2}>
          <Card title="진행 중 프로젝트">
            <div className={styles.stat}>8</div>
            <div className={styles.statSub}>AX 4 · 성당 3 · Creative 1</div>
          </Card>
          <Card title="AX 지원 미처리">
            <div className={styles.stat}>0</div>
            <div className={styles.statSub}>현재 미처리 문의 없음</div>
          </Card>
          <Card title="완료된 프로젝트">
            <div className={styles.stat}>2</div>
            <div className={styles.statSub}>사진 아카이브 · AI 전자책</div>
          </Card>
        </div>

        {/* 프로젝트 현황 */}
        <div className={styles.cols3}>
          <Card title="🚀 AX팀 프로젝트">
            {axProjects.length > 0 ? axProjects.map(p => (
              <ProjectRow key={p.href} href={p.href} name={p.name} badge={p.badge} type={p.type} due={p.due} />
            )) : <div className={styles.noResult}>검색 결과 없음</div>}
            <a className={styles.moreLink} href={NOTION.projects} target="_blank" rel="noreferrer">
              전체 프로젝트 DB →
            </a>
          </Card>

          <Card title="⛪ 성당 기획팀">
            {churchProjects.length > 0 ? churchProjects.map(p => (
              <ProjectRow key={p.href} href={p.href} name={p.name} badge={p.badge} type={p.type} due={p.due} />
            )) : <div className={styles.noResult}>검색 결과 없음</div>}
          </Card>

          <Card title="🎬 AI Creative">
            {creativeProjects.length > 0 ? creativeProjects.map(p => (
              <ProjectRow key={p.href} href={p.href} name={p.name} badge={p.badge} type={p.type} due={p.due} />
            )) : <div className={styles.noResult}>검색 결과 없음</div>}
          </Card>
        </div>

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

        {/* AX 지원 + 팀 공지 */}
        <div className={styles.cols2}>
          <Card title="🙋 AX 지원 현황">
            <div className={styles.emptyState}>미처리 문의가 없어요</div>
            <a className={styles.moreLink} href={NOTION.axSupport} target="_blank" rel="noreferrer">
              AX 지원 DB →
            </a>
          </Card>
          <Card title="📣 팀 공지 · 메모">
            <div className={styles.noticeRow}>💡 매주 월요일 업데이트</div>
            <a className={styles.moreLink} href={NOTION.axTeam} target="_blank" rel="noreferrer">
              AX팀 공용 대시보드 →
            </a>
            <a className={styles.moreLink} href="https://groups.office.hiworks.com/group/1025337/debates/all/" target="_blank" rel="noreferrer">
              💬 AX추진팀 그룹채팅 →
            </a>
          </Card>
        </div>
      </div>
    </div>
  )
}
