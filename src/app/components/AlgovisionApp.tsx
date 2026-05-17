'use client'

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { AlgorithmId, Language } from '../types'
import Link from 'next/link'
import { ALGORITHM_REGISTRY, SEARCH_ALGORITHMS } from '../data/registry'
import { useAlgorithmStore } from '../hooks/useAlgorithmStore'
import { Sidebar } from './Sidebar'
import { UnifiedVisualizer } from './UnifiedVisualizer'
import { CodePanel } from './CodePanel'
import { ShareButton } from '../../components/ShareButton'
import * as gtag from '../../lib/gtag'
import {
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Settings,
  Share2,
  Cpu,
  Minimize,
  Maximize,
  ChevronRight,
  Heart,
  MessageSquare,
  Info
} from './Icons'
import { UserStats } from './UserStats'
import { FeedbackModal } from './FeedbackModal'
import { TourGuide, DEFAULT_TOUR_STORAGE_KEY, type TourStep } from './TourGuide'
import { LEARNER_PROFILES } from '../data/learnerProfiles'
import { getAlgorithmAudio } from '../utils/audio'

interface AlgovisionAppProps {
  initialId?: AlgorithmId
}

export default function AlgovisionApp({ initialId }: AlgovisionAppProps = {}) {
  const searchParams = useSearchParams()

  const [selectedId, setSelectedId] = useState<AlgorithmId>(
    initialId || (searchParams.get('id') as AlgorithmId) || 'bubble-sort'
  )
  const [secondId, setSecondId] = useState<AlgorithmId>(
    (searchParams.get('battle') as AlgorithmId) || 'quick-sort'
  )
  const [isBattleMode, setIsBattleMode] = useState(searchParams.get('mode') === 'battle')
  const [language, setLanguage] = useState<Language>(
    (searchParams.get('lang') as Language) || 'typescript'
  )

  const [speed, setSpeed] = useState(50)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const layoutDensity: number = 1 // 1: Spacious, 2: Balanced, 3: Compact
  const [vizHeight, setVizHeight] = useState(500)
  const [data, setData] = useState<number[]>([45, 23, 89, 12, 56, 34, 78, 10, 67, 41])
  const [isLabOpen, setIsLabOpen] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isResizingAside, setIsResizingAside] = useState(false)
  const [asideWidth, setAsideWidth] = useState(380)
  const lastX = useRef(0)
  const lastY = useRef(0)

  // Initialize coordinates when starting resize
  useEffect(() => {
    if (isResizing || isResizingAside) {
      // We can't get mouse coords here easily, so we'll rely on the first move
      // or we can pass them from the mouseDown event
      lastX.current = 0
      lastY.current = 0
    }
  }, [isResizing, isResizingAside])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        if (lastY.current === 0) {
          lastY.current = e.clientY
          return
        }
        const deltaY = e.clientY - lastY.current
        lastY.current = e.clientY
        setVizHeight(prev => Math.max(160, Math.min(1200, prev + deltaY)))
      }
      if (isResizingAside) {
        if (lastX.current === 0) {
          lastX.current = e.clientX
          return
        }
        const deltaX = e.clientX - lastX.current
        lastX.current = e.clientX
        setAsideWidth(prev => Math.max(260, Math.min(600, prev + deltaX)))
      }
    }
    const onMouseUp = () => {
      setIsResizing(false)
      setIsResizingAside(false)
      lastX.current = 0
      lastY.current = 0
    }

    if (isResizing || isResizingAside) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isResizing, isResizingAside])
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [target, setTarget] = useState<number>(12)
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTourOpen, setIsTourOpen] = useState(false)

  const tourSteps = useMemo<TourStep[]>(() => [
    {
      target: '',
      title: 'Welcome to AlgoVision',
      body: 'A quick tour of the lab. Step through with Next, or press Esc to skip. You can relaunch this tour any time from the header.',
    },
    {
      target: '[data-tour="sidebar"]',
      title: 'Algorithm catalog',
      body: 'Pick any algorithm grouped by category — sorting, searching, graph, ML, and more. Selecting one loads its visualizer and code.',
      placement: 'right',
    },
    {
      target: '[data-tour="play-controls"]',
      title: 'Playback controls',
      body: 'Press Play to animate the trace step-by-step. Reset rewinds the run with the current dataset.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="speed"]',
      title: 'Speed',
      body: 'Drag to scale playback between slow inspection and fast sweeps.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="battle"]',
      title: 'Battle mode',
      body: 'Run two algorithms side-by-side on identical data. Great for comparing strategies (e.g. bubble vs quick sort).',
      placement: 'bottom',
    },
    {
      target: '[data-tour="utilities"]',
      title: 'Audio, theme, share',
      body: 'Toggle sound cues, flip light/dark, and share the current run via a deep link.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="focus"]',
      title: 'Focus mode',
      body: 'Hides the chrome so only the visualizer remains. Click anywhere to bring controls back briefly.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="viz"]',
      title: 'Visualizer',
      body: 'The main canvas. Watch comparisons, swaps, traversals, or grid moves render in real time. Resize via the bottom handle.',
      placement: 'top',
    },
    {
      target: '[data-tour="lab"]',
      title: 'Learner Lens & Lab',
      body: 'Read complexity, watch-points, and hints. Open the Lab gear to load presets, edit custom data, or change the search target.',
      placement: 'right',
    },
    {
      target: '[data-tour="code"]',
      title: 'Live code trace',
      body: 'The highlighted line is the one currently executing. Switch language to view the same algorithm in different syntaxes.',
      placement: 'top',
    },
    {
      target: '[data-tour="timeline"]',
      title: 'Timeline scrubber',
      body: 'Drag to any step in the run. Useful for inspecting a specific moment or replaying tricky transitions.',
      placement: 'top',
    },
    {
      target: '[data-tour="tour-button"]',
      title: 'Restart tour any time',
      body: 'Need a refresher? Click this Info icon to replay the tour. You are all set — happy exploring.',
      placement: 'bottom',
    },
  ], [])

  // Auto-open tour first visit
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const seen = window.localStorage.getItem(DEFAULT_TOUR_STORAGE_KEY)
      if (!seen) {
        const t = window.setTimeout(() => setIsTourOpen(true), 600)
        return () => window.clearTimeout(t)
      }
    } catch {
      // localStorage may be blocked — silently skip
    }
  }, [])

  const handleTourClose = useCallback((completed: boolean) => {
    setIsTourOpen(false)
    if (completed) {
      try { window.localStorage.setItem(DEFAULT_TOUR_STORAGE_KEY, '1') } catch { /* ignore */ }
      gtag.track('algovision_tour_complete', { event_category: 'engagement', event_label: 'tour' })
    } else {
      gtag.track('algovision_tour_skip', { event_category: 'engagement', event_label: 'tour' })
    }
  }, [])

  const handleTourOpen = useCallback(() => {
    setIsTourOpen(true)
    gtag.track('algovision_tour_open', { event_category: 'engagement', event_label: 'tour' })
  }, [])

  // Handle responsive state
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isFirstRender = useRef(true)
  const completionTrackedRef = useRef<string | null>(null)

  // Sync dark mode class
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isDarkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [isDarkMode])

  // Sync state to URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    params.set('id', selectedId)
    params.set('lang', language)
    if (isBattleMode) {
      params.set('mode', 'battle')
      params.set('battle', secondId)
    } else {
      params.delete('mode')
      params.delete('battle')
    }
    const query = params.toString()
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}`
    window.history.replaceState(null, '', nextUrl)
  }, [selectedId, language, isBattleMode, secondId])

  // Init analytics
  useEffect(() => {
    if (isFirstRender.current) {
      gtag.track('algovision_init', { event_category: 'navigation', event_label: 'algovision' })
      isFirstRender.current = false
    }
  }, [])

  const algoMetadata = ALGORITHM_REGISTRY[selectedId] || ALGORITHM_REGISTRY['bubble-sort']
  const usesArrayData = algoMetadata.visualType === 'array'
  const usesTarget = SEARCH_ALGORITHMS.has(selectedId)

  const leftStore = useAlgorithmStore()
  const rightStore = useAlgorithmStore()

  // Destructure stable methods to avoid infinite loops in handleReset
  const { init: leftInit, reset: leftReset } = leftStore
  const { init: rightInit, reset: rightReset } = rightStore

  const [isPlaying, setIsPlaying] = useState(false)

  const algoAudio = useMemo(() => (typeof window !== 'undefined' ? getAlgorithmAudio() : null), [])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    leftReset()
    rightReset()
    const gen = algoMetadata.visualType === 'grid' ? algoMetadata.generator(8) : algoMetadata.generator(data, target)
    leftInit(gen)
    if (isBattleMode) {
      const opp = ALGORITHM_REGISTRY[secondId]
      const gen2 = opp.visualType === 'grid' ? opp.generator(8) : opp.generator(data, target)
      rightInit(gen2)
    }
  }, [algoMetadata, data, target, isBattleMode, secondId, leftInit, leftReset, rightInit, rightReset])

  useEffect(() => {
    handleReset()
  }, [handleReset])

  const step = useCallback(() => {
    const leftRes = leftStore.step()
    const rightRes = isBattleMode ? rightStore.step() : { done: true }

    if (leftRes.done && (rightRes.done || !isBattleMode)) {
      setIsPlaying(false)
      return true
    }

    if (isAudioEnabled && leftStore.currentStep) {
      const { state } = leftStore.currentStep
      const isCompare = (state.comparingIndices?.length ?? 0) > 0
      const isSwap = (state.swappingIndices?.length ?? 0) > 0
      const isFound = state.foundIndex !== undefined && state.foundIndex >= 0

      if (isFound) algoAudio?.playPing(800, 0.2, 'success')
      else if (isSwap) algoAudio?.playSwap(400, 0.15)
      else if (isCompare) algoAudio?.playCompare(500, 0.1)
    }
    return false
  }, [leftStore, rightStore, isBattleMode, isAudioEnabled, algoAudio])

  const stepRef = useRef(step)
  useEffect(() => {
    stepRef.current = step
  }, [step])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (isPlaying) {
      const tickSpeed = Math.max(20, 1000 - speed * 9.5)
      timer = setInterval(() => {
        const finished = stepRef.current()
        if (finished && timer) clearInterval(timer)
      }, tickSpeed)
    }
    return () => { if (timer) clearInterval(timer) }
  }, [isPlaying, speed])

  useEffect(() => {
    completionTrackedRef.current = null
  }, [selectedId, data, target])

  useEffect(() => {
    if (!leftStore.isFinished) return
    const completionKey = `${selectedId}:${leftStore.totalSteps}:${data.join(',')}:${target}`
    if (completionTrackedRef.current === completionKey) return

    completionTrackedRef.current = completionKey
    gtag.track('algovision_complete', {
      event_category: 'engagement',
      event_label: selectedId,
      steps: leftStore.totalSteps,
    })
    if (isAudioEnabled) {
      algoAudio?.playPing(800, 0.15, 'success')
    }

    // Automatically trigger feedback modal after a short delay on completion
    const timer = setTimeout(() => {
      setIsFeedbackOpen(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [data, isAudioEnabled, leftStore.isFinished, leftStore.totalSteps, selectedId, target, algoAudio])

  const togglePlay = () => {
    gtag.track('algovision_playback_toggle', {
      event_category: 'engagement',
      event_label: isPlaying ? 'pause' : 'play',
      algorithm_id: selectedId,
    })
    setIsPlaying(!isPlaying)
  }
  const handleSelectAlgorithm = (id: AlgorithmId) => {
    gtag.track('algovision_select', {
      event_category: 'interaction',
      event_label: id,
    })
    setSelectedId(id)
  }
  const handleSelectSecond = (id: AlgorithmId) => {
    gtag.track('algovision_select_second', {
      event_category: 'interaction',
      event_label: id,
    })
    setSecondId(id)
  }
  const handleBattleToggle = () => setIsBattleMode(!isBattleMode)
  const handleThemeToggle = () => setIsDarkMode(!isDarkMode)
  const handleAudioToggle = () => setIsAudioEnabled(!isAudioEnabled)
  const handleSpeedChange = (nextSpeed: number) => {
    setSpeed(nextSpeed)
  }
  const handleScrub = (index: number) => {
    setIsPlaying(false)
    leftStore.goTo(index)
    if (isBattleMode) rightStore.goTo(index)
  }

  const handlePreset = (type: 'random' | 'reversed' | 'nearly' | 'duplicates') => {
    let newData: number[] = []
    const size = 10
    if (type === 'random') {
      newData = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10)
    } else if (type === 'reversed') {
      newData = Array.from({ length: size }, (_, i) => (size - i) * 10).reverse()
      newData.sort((a, b) => b - a)
    } else if (type === 'nearly') {
      newData = Array.from({ length: size }, (_, i) => (i + 1) * 10)
      const i1 = Math.floor(Math.random() * size)
      const i2 = Math.floor(Math.random() * size)
        ;[newData[i1], newData[i2]] = [newData[i2], newData[i1]]
    } else if (type === 'duplicates') {
      newData = [20, 20, 50, 50, 80, 80, 40, 40, 60, 60]
    }

    gtag.track('algovision_preset_select', {
      event_category: 'interaction',
      event_label: type,
    })

    setData(newData)
    handleReset()
  }

  const activeProfile = LEARNER_PROFILES[algoMetadata.visualType] || LEARNER_PROFILES['array']
  const activeCode = algoMetadata?.code?.[language] || ''
  const opponentCode = isBattleMode ? ALGORITHM_REGISTRY[secondId]?.code?.[language] || '' : ''
  const progress = leftStore.totalSteps > 0 ? (leftStore.currentIndex / (leftStore.totalSteps - 1)) * 100 : 0

  const headerTransitionClass = isFocusMode
    ? 'fixed inset-x-0 top-0 ' + (isMenuVisible ? 'translate-y-0 opacity-100' : '-translate-y-[calc(100%-4px)] opacity-0') + ' hover:translate-y-0 hover:opacity-100 px-6 py-4 sm:px-10 sm:py-6'
    : 'relative translate-y-0 opacity-100'

  const battleToggleClass = isBattleMode
    ? 'bg-lime-500 text-white dark:bg-lime-300 dark:text-black'
    : 'bg-[var(--border)] text-[var(--muted)] hover:text-[var(--ink)]'

  const focusToggleClass = isFocusMode
    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
    : 'text-[var(--ink)]/60 hover:text-[var(--ink)]'

  return (
    <div
      onClick={() => {
        if (isFocusMode) setIsMenuVisible(!isMenuVisible)
      }}
      className={`site-bg relative flex min-h-[100svh] w-full flex-col font-sans transition-colors duration-500 text-[var(--ink)] touch-pan-y ${isDarkMode ? 'dark' : ''}`}
    >
      <OrientationGuard />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,var(--accent),transparent_28%),radial-gradient(circle_at_86%_18%,var(--pink),transparent_32%)] opacity-[0.08] dark:opacity-[0.12]" />

      {/* 🚀 FIXED HEADER CONTROLS (FIT IN FIRST SCREEN) */}
      <header
        onClick={(e) => e.stopPropagation()}
        className={`peer z-[60] border-b border-[var(--border)] bg-[var(--card)]/80 px-3 transition-all duration-500 sm:px-6 ${headerTransitionClass} ${layoutDensity === 3 ? 'h-12' : 'h-[var(--header-h)]'} flex items-center pt-[var(--safe-top)]`}
      >
        <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="transition-transform active:scale-95">
              <h1 className="text-sm sm:text-xl font-black lowercase tracking-tighter">algovision.</h1>
            </Link>
            <div className="hidden h-5 w-px bg-[var(--border)] sm:block" />
            <div className="hidden sm:block">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">{algoMetadata.label}</span>
            </div>
          </div>

          {/* CENTRAL COMMAND CENTER */}
          <div className="flex items-center gap-3">
            <div data-tour="play-controls" className="flex items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-sm">
              <button
                onClick={togglePlay}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95 ${isPlaying ? 'bg-cyan-600 text-white' : 'bg-[var(--accent)] text-white shadow-lg shadow-cyan-500/20 dark:text-black'
                  }`}
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
              </button>
              <button
                onClick={handleReset}
                aria-label="Reset algorithm"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--ink)]"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <div className="hidden h-8 w-px bg-[var(--border)] md:block" />

            {/* BREADCRUMB PATH - HEADER STYLE */}
            {!isFocusMode && (
              <div className="hidden items-center gap-1.5 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)] lg:flex">
                <span className="text-[var(--accent)]">algovision</span>
                <span className="opacity-30">/</span>
                <span>{algoMetadata.categoryId}</span>
                <span className="opacity-30">/</span>
                <span className="text-[var(--ink)]">{algoMetadata.id}</span>
              </div>
            )}

            <div className="hidden h-8 w-px bg-[var(--border)] lg:block" />

            <div className="hidden items-center gap-3 md:flex">
              <div data-tour="speed" className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[var(--muted)]">SPEED</span>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={speed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="w-20 cursor-pointer accent-[var(--accent)]"
                />
              </div>
            </div>

            <div className="h-8 w-px bg-[var(--border)]" />

            <button
              data-tour="battle"
              onClick={handleBattleToggle}
              className={`h-9 rounded-xl px-3 text-[9px] font-black uppercase tracking-widest transition-all ${battleToggleClass}`}
            >
              Battle
            </button>

            <div data-tour="utilities" className="flex items-center gap-1">
              <ShareButton
                text={`Check out this ${algoMetadata.label} visualization!`}
                eventName="algovision_share"
                eventParams={{ algorithm_id: selectedId }}
                className="hidden p-2 text-[var(--ink)]/60 hover:text-[var(--ink)] md:block"
              >
                <Share2 size={16} />
              </ShareButton>
              <button onClick={handleAudioToggle} aria-label={isAudioEnabled ? 'Mute audio' : 'Unmute audio'} className="p-2 text-[var(--ink)]/60 hover:text-[var(--ink)]">
                {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button onClick={handleThemeToggle} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} className="p-2 text-[var(--ink)]/60 hover:text-[var(--ink)]">
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>

            <div className="h-8 w-px bg-[var(--border)]" />

            <button
              data-tour="tour-button"
              onClick={handleTourOpen}
              aria-label="Start product tour"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--ink)]/60 hover:text-[var(--ink)] hover:bg-[var(--border)]/40 transition-all active:scale-95"
              title="Tour"
            >
              <Info size={16} />
            </button>

            <button
              data-tour="focus"
              onClick={() => setIsFocusMode(!isFocusMode)}
              aria-label={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95 ${focusToggleClass}`}
            >
              {isFocusMode ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
      </header>
      {/* 🖱️ HEADER TRIGGER AREA - REVEALS ON TOP HOVER */}
      {isFocusMode && <div className="fixed inset-x-0 top-0 z-[55] h-6 hover:peer-[]:translate-y-0" />}

      {/* 🧩 MAIN APP GRID (REMAINDER OF SCREEN) */}
      <div className={`relative flex flex-col lg:flex-row flex-1 overflow-hidden transition-all duration-500 ${isFocusMode ? 'h-full w-full' : ''}`}>
        {/* SIDEBAR - LEFT NAV (HIDDEN ON MOBILE) */}
        <AnimatePresence>
          {!isFocusMode && (
            <motion.aside
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: isMobile ? 'auto' : '100%',
                width: isMobile ? '100%' : 320,
                opacity: 1
              }}
              exit={{ height: 0, opacity: 0 }}
              className="flex shrink-0 flex-col border-b border-[var(--border)] p-2 lg:p-4 lg:border-b-0 lg:border-r overflow-hidden max-h-[40vh] lg:max-h-none"
              onClick={(e) => e.stopPropagation()}
              data-tour="sidebar"
            >
              <Sidebar
                selectedId={selectedId}
                secondId={secondId}
                isBattleMode={isBattleMode}
                onSelect={handleSelectAlgorithm}
                onSelectSecond={handleSelectSecond}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        <main className={`flex min-w-0 flex-1 flex-col overflow-y-auto transition-all duration-500 touch-pan-y ${isFocusMode ? 'p-0 m-0' : 'w-full'}`}>
          {/* PROGRESS SUB-HEADER */}
          {!isFocusMode && (
            <div className="flex shrink-0 items-center border-b border-[var(--border)] bg-[var(--card)]/20">
              <div className="flex h-8 sm:h-10 w-full items-center px-4 sm:px-6">
                <div className="mr-3 sm:mr-4 flex shrink-0 items-center gap-2">
                  <span className="font-mono text-[9px] sm:text-[10px] font-black text-[var(--accent)]">{Math.round(progress)}%</span>
                  <div className="h-0.5 sm:h-1 w-20 sm:w-32 rounded-full bg-[var(--border)] overflow-hidden">
                    <div className="h-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <p className="flex-1 truncate text-[10px] sm:text-[11px] font-semibold text-[var(--muted)]">
                  <span className="font-black uppercase text-[var(--muted)]/60 mr-2">LOG:</span>
                  {leftStore.currentStep?.description || 'System idle. Waiting for trace start...'}
                </p>
              </div>
            </div>
          )}

          {/* VIEWPORT GRID */}
          <div className={`flex shrink-0 lg:flex-1 flex-col transition-all duration-500 ${isFocusMode ? 'p-6 sm:p-10' : layoutDensity === 3 ? 'p-1.5 sm:p-2' : layoutDensity === 2 ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'}`}>
            <div
              style={{ gridTemplateColumns: isFocusMode ? '1fr' : `${asideWidth}px 1fr` }}
              className={`grid lg:h-full transition-all duration-500 ${isFocusMode ? '' : 'xl:grid-cols-[var(--aside-w)_1fr]'} ${layoutDensity === 3 ? 'gap-1.5 sm:gap-2' : layoutDensity === 2 ? 'gap-2.5 sm:gap-3' : 'gap-3 sm:gap-4'}`}>
              {/* ASIDE - FIXED WIDTH */}
              {!isFocusMode && (
                <aside
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: `${asideWidth}px` }}
                  className={`relative hidden flex-col gap-4 overflow-visible xl:flex ${isResizingAside ? '' : 'transition-all duration-500'}`}
                >
                  {/* Aside Resize Handle */}
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setIsResizingAside(true)
                    }}
                    className="group absolute -right-1.5 top-1/2 z-50 h-32 w-1.5 -translate-y-1/2 cursor-ew-resize py-4"
                  >
                    <div className="h-full w-0.5 rounded-full bg-[var(--border)] opacity-30 transition-all group-hover:bg-[var(--accent)] group-hover:opacity-100" />
                  </div>

                  <div data-tour="lab" className="flex-1 overflow-auto rounded-[2rem] border border-[var(--border)]/50 bg-[var(--card)] p-5 shadow-[var(--shadow-premium)] backdrop-blur-xl">
                    <div className={`h-1.5 shrink-0 bg-gradient-to-r ${activeProfile.palette} -mx-5 -mt-5 mb-5`} />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">{isLabOpen ? 'Laboratory' : 'Insights'}</p>
                        <h3 className="mt-1 text-lg font-black tracking-tighter text-[var(--ink)]">Learner Lens</h3>
                      </div>
                      <button
                        onClick={() => setIsLabOpen(!isLabOpen)}
                        className={`group flex h-8 w-8 items-center justify-center rounded-xl border transition-all active:scale-95 ${isLabOpen
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-lg shadow-cyan-500/20'
                          : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--accent)] shadow-sm'
                          }`}
                        title={isLabOpen ? 'Close Laboratory' : 'Open Laboratory Settings'}
                      >
                        <Settings size={14} className={isLabOpen ? 'animate-spin-slow' : 'group-hover:rotate-45 transition-transform'} />
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {isLabOpen ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6">
                          <div className="space-y-6">
                            <div className="h-px bg-[var(--border)]" />

                            {usesArrayData ? (
                              <>
                                <div className="space-y-2">
                                  <p className="font-mono text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">PRESETS</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <PresetButton onClick={() => handlePreset('random')}>Random</PresetButton>
                                    <PresetButton onClick={() => handlePreset('reversed')}>Reversed</PresetButton>
                                    <PresetButton onClick={() => handlePreset('nearly')}>Nearly</PresetButton>
                                    <PresetButton onClick={() => handlePreset('duplicates')}>Duplicates</PresetButton>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <p className="font-mono text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">CUSTOM DATA</p>
                                  <input
                                    type="text"
                                    value={data.join(', ')}
                                    onChange={(e) => {
                                      const values = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v))
                                      if (values.length > 0) setData(values)
                                    }}
                                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 font-mono text-xs shadow-sm focus:border-[var(--accent)] outline-none transition-all"
                                  />
                                </div>
                                {usesTarget && (
                                  <div className="space-y-2">
                                    <p className="font-mono text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">TARGET VALUE</p>
                                    <input
                                      type="number"
                                      value={target}
                                      onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 font-mono text-xs shadow-sm focus:border-[var(--accent)] outline-none transition-all"
                                    />
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex h-40 flex-col items-center justify-center gap-2 text-center opacity-40">
                                <Cpu size={24} />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Interactive Lab Unavailable</p>
                                <p className="max-w-[140px] text-[10px]">Custom data only supported for array-based algorithms currently.</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="insights"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="mt-6 space-y-4"
                        >
                          <div className="space-y-3">
                            <LensBlock label="Watch" text={activeProfile.watch} />
                            <LensBlock label="Action" text={activeProfile.tryThis} />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <MetricRow label="Time" value={algoMetadata.timeComplexity} />
                            <MetricRow label="Space" value={algoMetadata.spaceComplexity} />
                          </div>

                          <div className="rounded-xl bg-[var(--border)]/10 p-4">
                            <p className="text-[11px] font-semibold leading-relaxed text-[var(--muted)]">{algoMetadata.description}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </aside>
              )}
              <div className="flex flex-col gap-3 sm:gap-4 flex-1">

                {/* VISUALIZER - FLEXIBLE */}
                <div
                  data-tour="viz"
                  style={{ height: isFocusMode ? '100%' : `${vizHeight}px` }}
                  className={`relative overflow-hidden bg-[var(--card)] shadow-sm ${isResizing ? '' : 'transition-all duration-500'} ${isFocusMode ? 'rounded-none border-0 flex-1 h-full' : 'rounded-3xl border border-[var(--border)] flex-none'
                    } ${isBattleMode ? 'grid grid-cols-1 lg:grid-cols-2 gap-px bg-[var(--border)]' : ''} [@media(max-height:500px)]:flex-1`}>
                  <UnifiedVisualizer
                    step={leftStore.currentStep}
                    algorithmId={selectedId}
                    visualType={algoMetadata.visualType}
                    label={algoMetadata.label}
                    isBattleMode={isBattleMode}
                    isFocusMode={isFocusMode}
                  />

                  {isBattleMode && (
                    <div className="relative border-l border-black/5 dark:border-white/10">
                      <UnifiedVisualizer
                        step={rightStore.currentStep}
                        algorithmId={secondId}
                        visualType={ALGORITHM_REGISTRY[secondId]?.visualType || 'array'}
                        label={ALGORITHM_REGISTRY[secondId]?.label || ''}
                        isBattleMode={true}
                        isFocusMode={isFocusMode}
                      />
                    </div>
                  )}

                  {/* INTERACTIVE RESIZE HANDLE */}
                  {!isFocusMode && (
                    <>
                      {/* Edge Handle */}
                      <div
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setIsResizing(true)
                        }}
                        className="group absolute bottom-0 left-0 right-0 z-50 h-2 cursor-ns-resize"
                      >
                        <div className="mx-auto h-0.5 w-12 rounded-full bg-[var(--border)] opacity-30 transition-all group-hover:w-24 group-hover:bg-[var(--accent)] group-hover:opacity-100" />
                      </div>
                      {/* Corner Handle */}
                      <div
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setIsResizing(true)
                        }}
                        className="group absolute bottom-1.5 right-1.5 z-50 flex h-5 w-5 cursor-nwse-resize items-center justify-center"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-[var(--border)] opacity-30 transition-all group-hover:bg-[var(--accent)] group-hover:opacity-100" />
                        <div className="absolute h-full w-full rounded-br-lg border-b-2 border-r-2 border-[var(--border)] opacity-20 transition-all group-hover:border-[var(--accent)] group-hover:opacity-100" />
                      </div>
                    </>
                  )}
                </div>

                {/* CODE TRACE - COMPACT BUT SCROLLABLE */}
                <div data-tour="code" className={`grid gap-3 sm:gap-4 transition-all duration-500 ${layoutDensity === 3 ? 'min-h-[140px]' : layoutDensity === 2 ? 'min-h-[180px]' : 'min-h-[var(--min-h-code)]'} ${isBattleMode ? 'grid-cols-1 lg:grid-cols-2' : ''} [@media(max-height:500px)]:hidden`}>
                  <CodePanel
                    code={activeCode}
                    activeLine={leftStore.currentStep?.codeLine || 0}
                    language={language}
                    onLanguageChange={setLanguage}
                    title="Trace"
                  />
                  {isBattleMode && (
                    <CodePanel
                      code={opponentCode}
                      activeLine={rightStore.currentStep?.codeLine || 0}
                      language={language}
                      onLanguageChange={setLanguage}
                      title="Versus"
                    />
                  )}
                </div>

                {/* TIMELINE - INTEGRATED */}
                <div data-tour="timeline" className="shrink-0 rounded-2xl bg-black/[0.02] p-2 dark:bg-white/[0.02]">
                  <input
                    type="range"
                    min="0"
                    max={leftStore.totalSteps > 0 ? leftStore.totalSteps - 1 : 0}
                    value={leftStore.currentIndex}
                    onChange={(e) => handleScrub(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>


            </div>


          </div>
        </main>
      </div>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <TourGuide
        isOpen={isTourOpen}
        steps={tourSteps}
        onClose={handleTourClose}
      />

      {/* GLOBAL FOOTER */}
      {!isFocusMode && (
        <footer className="mt-auto border-t border-[var(--border)]/30 bg-[var(--card)]/80 p-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <a
                href="https://vishvavariya.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 transition-all hover:border-[var(--accent)]/30 lg:w-[400px]"
              >
                <div>
                  <p className="font-mono text-[8px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">developer</p>
                  <p className="text-xs font-black text-[var(--ink)]">vishvavariya.com</p>
                </div>
                <ChevronRight size={14} className="text-[var(--border)] transition-transform group-hover:translate-x-1" />
              </a>

              <div className="flex flex-1 gap-3">
                <a
                  href="https://ko-fi.com/vishvavariya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 transition-all hover:bg-rose-500/5 group"
                >
                  <Heart size={14} className="text-rose-500 transition-transform group-hover:scale-110" fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--ink)]">Support</span>
                </a>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 transition-all hover:bg-[var(--accent)]/5 group"
                >
                  <MessageSquare size={14} className="text-[var(--accent)] transition-transform group-hover:scale-110" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--ink)]">Feedback</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-[var(--border)]/10" />
            <UserStats />
          </div>
        </footer>
      )}

      {/* FOCUS MODE TOGGLE (ALWAYS ACCESSIBLE WHEN FOCUSED) */}
      {isFocusMode && (
        <button
          onClick={() => setIsFocusMode(false)}
          className="fixed bottom-6 right-6 z-[70] flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xl hover:bg-black transition-all"
          aria-label="Exit focus mode"
        >
          <Minimize size={20} />
        </button>
      )}
    </div>
  )
}

function LensBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)]/40 bg-[var(--border)]/5 p-3">
      <p className="font-mono text-[8px] font-black uppercase tracking-widest text-[var(--accent)]">{label}</p>
      <p className="mt-1 text-[11px] font-semibold leading-snug text-[var(--ink)]">{text}</p>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--border)]/20 p-2">
      <p className="text-[8px] font-black uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-0.5 truncate font-mono text-[10px] font-black text-[var(--ink)]">{value}</p>
    </div>
  )
}

function PresetButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-[var(--border)]/20 p-2 text-[10px] font-black uppercase tracking-widest text-[var(--ink)] transition-all hover:bg-[var(--border)]/40 hover:text-[var(--accent)] active:scale-95 shadow-sm"
    >
      {children}
    </button>
  )
}

function OrientationGuard() {
  const [dismissed, setDismissed] = React.useState(false)

  if (dismissed) return null

  return (
    <div className="fixed inset-0 z-[9999] hidden flex-col items-center justify-center bg-[var(--cream)]/95 p-8 text-center backdrop-blur-2xl dark:bg-black/95 portrait:flex lg:hidden">
      <div className="relative mb-8">
        <motion.div
          animate={{ rotate: [0, 90, 90, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-20 w-12 rounded-lg border-2 border-[var(--ink)] bg-white/20 p-2 dark:border-white"
        >
          <div className="h-full w-full rounded bg-[var(--accent)]/30" />
        </motion.div>
        <div className="absolute -bottom-2 -right-2">
          <RotateCcw size={24} className="text-[var(--accent)]" />
        </div>
      </div>

      <h2 className="text-2xl font-black tracking-tight text-[var(--ink)] dark:text-white">Landscape Best</h2>
      <p className="mt-3 max-w-[240px] text-sm font-semibold leading-relaxed text-[var(--muted)]">
        The laboratory is optimized for landscape. Please rotate for the full experience.
      </p>

      <div className="mt-10 flex h-1 w-24 overflow-hidden rounded-full bg-[var(--border)]">
        <motion.div
          animate={{ x: [-100, 100] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="h-full w-1/2 bg-[var(--accent)]"
        />
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] underline underline-offset-4"
      >
        Continue anyway
      </button>
    </div>
  )
}
