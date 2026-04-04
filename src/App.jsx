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

function ProjectRow({ href, name, badge, type }) {
  return (
    <a className={styles.prow} href={href} target="_blank" rel="noreferrer">
      <span className={styles.prowName}>{name}</span>
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

export default function App() {
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const d = new Date()
    const days = ['일','월','화','수','목','금','토']
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    setDateStr(`${y}.${m}.${day} (${days[d.getDay()]})`)
  }, [])

  return (
    <div className={styles.wrap}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>📊 전체 업무 현황</h1>
          <p className={styles.sub}>써니제이 전용 · 매일 아침 여기서 시작하세요</p>
        </div>
        <span className={styles.dateChip}>{dateStr}</span>
      </header>

      {/* 숫자 카드 */}
      <div className={styles.cols3}>
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
      <div className={styles.cols2}>
        <Card title="🚀 AX팀 프로젝트">
          <ProjectRow href={NOTION.ezInterview} name="EZ Interview AI 모더레이터" badge="🔴 높음" type="red" />
          <ProjectRow href={NOTION.synth}       name="합성패널"                   badge="🔴 높음" type="red" />
          <ProjectRow href={NOTION.aiMod}       name="AI 모더레이터 고도화"       badge="🟡 중간" type="yellow" />
          <ProjectRow href={NOTION.automate}    name="업무자동화"                 badge="🟡 중간" type="yellow" />
          <a className={styles.moreLink} href={NOTION.projects} target="_blank" rel="noreferrer">
            전체 프로젝트 DB →
          </a>
        </Card>

        <Card title="⛪ 성당 기획팀 · 🎬 AI Creative">
          <div className={styles.groupLabel}>성당 기획팀</div>
          <ProjectRow href={NOTION.club}  name="동호회"       badge="진행 중" type="yellow" />
          <ProjectRow href={NOTION.note}  name="신자노트 제작" badge="진행 중" type="yellow" />
          <ProjectRow href={NOTION.bible} name="성경 출판"     badge="진행 중" type="yellow" />
          <div className={styles.groupLabel}>AI Creative</div>
          <ProjectRow href={NOTION.walk}  name="WALK (산책)"            badge="제작 중" type="purple" />
          <ProjectRow href={NOTION.mazu}  name="MAZU: THE GREAT WORK"   badge="기획 중" type="blue" />
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
        </Card>
      </div>

      {/* 빠른 이동 */}
      <Card title="⚡ 빠른 이동">
        <div className={styles.quickGrid}>
          <QuickBtn href={NOTION.projects}>🚀 전체 프로젝트</QuickBtn>
          <QuickBtn href={NOTION.axTeam}>📊 AX팀 공용</QuickBtn>
          <QuickBtn href={NOTION.aiAssets}>📚 AI Assets DB</QuickBtn>
          <QuickBtn href={NOTION.education}>🎓 교육·전파</QuickBtn>
          <QuickBtn href={NOTION.axSupport}>🙋 AX 지원</QuickBtn>
          <QuickBtn href={NOTION.teamOps}>👥 팀 운영</QuickBtn>
          <QuickBtn href={NOTION.creative}>🎬 AI Creative</QuickBtn>
          <QuickBtn href={NOTION.church}>⛪ 성당 기획팀</QuickBtn>
          <QuickBtn href={NOTION.guide}>📘 운영가이드</QuickBtn>
          <QuickBtn href="https://dashboard.office.hiworks.com/">📧 하이웍스 메일</QuickBtn>
          <QuickBtn href="https://kp.embrain.com/search/loginpage.do">🤖 AI게시판</QuickBtn>
          <QuickBtn href="https://kpad.embrain.com/search/adminProposal.do">🤖 AI게시판(관리)</QuickBtn>
        </div>
      </Card>
    </div>
  )
}
