'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { AlgorithmId, AlgorithmStep } from '../types'
import { ZoomIn, ZoomOut, RotateCcw } from './Icons'

interface VisualizerCanvasProps {
  step: AlgorithmStep | null
  algorithmId?: AlgorithmId
  label?: string
  accentColor?: string
  showMetrics?: boolean
  isBattleMode?: boolean
  isFocusMode?: boolean
}

type ArrayScene = {
  mode: 'avatars' | 'cards' | 'scanner' | 'pivot' | 'factory' | 'spotlight' | 'remote'
  title: string
  metaphor: string
  primary: string
  secondary: string
  surface: string
}

const ARRAY_SCENES: Partial<Record<AlgorithmId, ArrayScene>> = {
  'bubble-sort': {
    mode: 'avatars',
    title: 'Bubble Sort',
    metaphor: 'Adjacent elements are compared and swapped if they are in the wrong order.',
    primary: '#f97316',
    secondary: '#38bdf8',
    surface: 'var(--canvas-bg)',
  },
  'insertion-sort': {
    mode: 'cards',
    title: 'Insertion Sort',
    metaphor: 'Builds the sorted array one item at a time by inserting elements into their correct position.',
    primary: '#f43f5e',
    secondary: '#facc15',
    surface: 'var(--canvas-bg)',
  },
  'selection-sort': {
    mode: 'scanner',
    title: 'Selection Sort',
    metaphor: 'Finds the minimum element from the unsorted part and moves it to the beginning.',
    primary: '#22c55e',
    secondary: '#fde047',
    surface: 'var(--canvas-bg)',
  },
  'quick-sort': {
    mode: 'pivot',
    title: 'Quick Sort',
    metaphor: 'Divides the array around a pivot element and recursively sorts the sub-arrays.',
    primary: '#a855f7',
    secondary: '#2dd4bf',
    surface: 'var(--canvas-bg)',
  },
  'merge-sort': {
    mode: 'factory',
    title: 'Merge Sort',
    metaphor: 'Divides the array into halves, sorts them, and then merges them back together.',
    primary: '#60a5fa',
    secondary: '#fb7185',
    surface: 'var(--canvas-bg)',
  },
  'heap-sort': {
    mode: 'factory',
    title: 'Heap Sort',
    metaphor: 'Builds a heap and repeatedly extracts the maximum element to sort the array.',
    primary: '#f97316',
    secondary: '#a3e635',
    surface: 'var(--canvas-bg)',
  },
  'counting-sort': {
    mode: 'scanner',
    title: 'Counting Sort',
    metaphor: 'Counts how often each value appears, then rebuilds the array from those frequencies.',
    primary: '#34d399',
    secondary: '#facc15',
    surface: 'var(--canvas-bg)',
  },
  'linear-search': {
    mode: 'spotlight',
    title: 'Linear Search',
    metaphor: 'Checks every element in sequence until the target value is found.',
    primary: '#f59e0b',
    secondary: '#22d3ee',
    surface: 'var(--canvas-bg)',
  },
  'binary-search': {
    mode: 'remote',
    title: 'Binary Search',
    metaphor: 'Repeatedly divides the search interval in half to find the target value.',
    primary: '#38bdf8',
    secondary: '#f472b6',
    surface: 'var(--canvas-bg)',
  },
  'jump-search': {
    mode: 'spotlight',
    title: 'Jump Search',
    metaphor: 'Skips ahead by fixed steps and then performs a linear search within a block.',
    primary: '#22d3ee',
    secondary: '#f59e0b',
    surface: 'radial-gradient(circle at 22% 18%, rgba(34,211,238,0.22), transparent 34%), radial-gradient(circle at 78% 76%, rgba(245,158,11,0.16), transparent 32%), #05080b',
  },
}

const DEFAULT_SCENE: ArrayScene = {
  mode: 'scanner',
  title: 'Algorithm Theater',
  metaphor: 'Every state change leaves a visual bruise, spark, or trail.',
  primary: '#22d3ee',
  secondary: '#a3e635',
  surface: 'radial-gradient(circle at 20% 18%, rgba(34,211,238,0.2), transparent 34%), radial-gradient(circle at 80% 76%, rgba(163,230,53,0.13), transparent 32%), #06080a',
}

const PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 29) % 100}%`,
  top: `${12 + ((index * 17) % 74)}%`,
  size: 2 + (index % 4),
  delay: index * 0.08,
}))

export function VisualizerCanvas({
  step,
  algorithmId = 'bubble-sort',
  label,
  accentColor = '#22d3ee',
  showMetrics = true,
  isBattleMode = false,
  isFocusMode = false,
}: VisualizerCanvasProps) {
  const reduceMotion = useReducedMotion()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 5))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.2))
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setLastPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - lastPos.x
    const dy = e.clientY - lastPos.y
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    setLastPos({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp)
      return () => window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  if (!step) {
    return (
      <div className="flex min-h-[340px] flex-1 items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-[#070707] px-4 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
        Preparing the lab bench
      </div>
    )
  }

  const { state } = step
  const data = state.array || []
  const maxValue = Math.max(...data, 1)
  const scene = ARRAY_SCENES[algorithmId] || DEFAULT_SCENE
  const activeIndices = [
    ...(state.comparingIndices || []),
    ...(state.swappingIndices || []),
    ...(state.pivotIndex !== undefined ? [state.pivotIndex] : []),
    ...(state.foundIndex !== undefined && state.foundIndex >= 0 ? [state.foundIndex] : []),
  ]
  const tension = state.swappingIndices?.length
    ? 'collision'
    : state.comparingIndices?.length
      ? 'comparison'
      : state.foundIndex !== undefined
        ? 'result'
        : 'idle'

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onWheel={(e) => {
        if (e.ctrlKey || e.metaKey) {
          if (e.deltaY < 0) handleZoomIn()
          else handleZoomOut()
          e.preventDefault()
        }
      }}
      className={`relative flex min-h-[var(--min-h-viz)] flex-1 flex-col overflow-hidden text-[var(--ink)] transition-all duration-500 sm:min-h-[480px] ${
        isFocusMode ? 'rounded-none border-0 p-6 sm:p-10 shadow-none' : 'rounded-[2.5rem] border border-[var(--border)]/50 p-4 shadow-[var(--shadow-xl)] sm:p-6'
      } ${isBattleMode ? 'sm:p-4' : ''} ${isDragging ? 'cursor-grabbing touch-none' : 'cursor-grab touch-pan-y'}`}
      style={{ background: 'var(--canvas-bg)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* AMBIENT SOFT GLOWS */}
      {scene && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 h-[40%] w-[40%] opacity-[0.03]" style={{ background: `radial-gradient(circle at 0% 0%, ${scene.primary}, transparent 70%)` }} />
          <div className="pointer-events-none absolute bottom-0 right-0 h-[40%] w-[40%] opacity-[0.03]" style={{ background: `radial-gradient(circle at 100% 100%, ${scene.secondary}, transparent 70%)` }} />
        </>
      )}

      {/* ZOOM CONTROLS */}
      <div className={`absolute z-40 flex flex-col gap-2 transition-all duration-500 ${isFocusMode ? 'right-6 top-32 sm:right-10 sm:top-40' : 'right-4 top-24'}`}>
        <CanvasControlButton onClick={(e) => { e.stopPropagation(); handleZoomIn() }} title="Zoom In"><ZoomIn size={14} /></CanvasControlButton>
        <CanvasControlButton onClick={(e) => { e.stopPropagation(); handleZoomOut() }} title="Zoom Out"><ZoomOut size={14} /></CanvasControlButton>
        <CanvasControlButton onClick={(e) => { e.stopPropagation(); handleReset() }} title="Reset View"><RotateCcw size={14} /></CanvasControlButton>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.05))]" />
      {!reduceMotion && (
        <div className="pointer-events-none absolute inset-0">
          {PARTICLES.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.id % 2 ? scene.primary : scene.primary,
              }}
              animate={{ opacity: [0.1, 0.7, 0.1], scale: [1, 1.8, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: particle.delay }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full shadow-[0_0_18px_currentColor]" style={{ color: scene.primary, backgroundColor: scene.primary }} />
            <h3 className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">{label || 'Visualizer'}</h3>
          </div>
          <p className="mt-2 max-w-xl font-black tracking-[-0.03em] text-[var(--ink)] text-lg sm:text-2xl">{scene.title}</p>
          <p className="mt-1 max-w-xl font-semibold leading-5 text-[var(--muted)]/80 text-xs sm:text-sm">{scene.metaphor}</p>
        </div>
        {showMetrics && (
          <div className={`rounded-2xl border border-[var(--border)] bg-[var(--card)]/30 px-3 py-2 text-right font-mono text-[9px] font-black uppercase text-[var(--muted)]/50 backdrop-blur ${
            isBattleMode ? 'tracking-[0.05em]' : 'tracking-[0.2em]'
          }`}>
            <div style={{ color: scene.secondary }}>line {step.codeLine}</div>
            <div className="text-[var(--muted)]">{tension}</div>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-5 flex flex-1 items-end justify-center pb-24 pt-3 sm:pb-28 overflow-hidden">
        <motion.div
          animate={{
            scale: zoom,
            x: pan.x,
            y: pan.y
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`relative flex h-full w-fit max-w-5xl items-end justify-center p-8 sm:p-12 ${
            isBattleMode ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-3'
          } ${
            scene.mode === 'remote' ? 'rounded-[2rem] border border-white/10 bg-black/20 px-2 sm:px-6' : ''
          }`}
        >
          <ArrayTensionLayer
            activeIndices={activeIndices}
            count={data.length}
            scene={scene}
            reduceMotion={Boolean(reduceMotion)}
          />
          {data.map((value, index) => (
            <ArrayActor
              key={`${algorithmId}-${index}-${value}`}
              algorithmId={algorithmId}
              value={value}
              index={index}
              maxValue={maxValue}
              scene={scene}
              isComparing={state.comparingIndices?.includes(index) || false}
              isSwapping={state.swappingIndices?.includes(index) || false}
              isSorted={state.sortedIndices?.includes(index) || false}
              isPivot={state.pivotIndex === index}
              isFound={state.foundIndex === index}
              isEliminated={isBinaryEliminated(algorithmId, step, index)}
              reduceMotion={Boolean(reduceMotion)}
              accentColor={accentColor}
              isBattleMode={isBattleMode}
            />
          ))}
        </motion.div>
      </div>

      <StepNarration step={step} isFocusMode={isFocusMode} />
    </div>
  )
}

function ArrayActor({
  value,
  index,
  maxValue,
  scene,
  isComparing,
  isSwapping,
  isSorted,
  isPivot,
  isFound,
  isEliminated,
  reduceMotion,
  accentColor,
  isBattleMode,
}: {
  algorithmId: AlgorithmId
  value: number
  index: number
  maxValue: number
  scene: ArrayScene
  isComparing: boolean
  isSwapping: boolean
  isSorted: boolean
  isPivot: boolean
  isFound: boolean
  isEliminated: boolean
  reduceMotion: boolean
  accentColor: string
  isBattleMode: boolean
}) {
  const height = `${Math.max(24, (value / maxValue) * 78)}%`
  const tone = isFound
    ? '#facc15'
    : isSorted
      ? '#34d399'
      : isSwapping
        ? '#fb7185'
        : isPivot
          ? scene.primary
          : isComparing
            ? scene.secondary
            : accentColor
  const label = actorLabel(scene.mode, value, index)

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        height: scene.mode === 'avatars' ? '72%' : height,
        opacity: isEliminated ? 0.22 : 1,
        y: actorLift(scene.mode, value, maxValue, isComparing, isSwapping, isPivot, isFound),
        scale: isComparing || isSwapping || isFound ? 1.07 : isEliminated ? 0.88 : 1,
        rotate: reduceMotion ? 0 : actorRotate(scene.mode, isComparing, isSwapping, isPivot, index),
        x: !reduceMotion && isSwapping ? [0, -5, 5, -3, 0] : 0,
        filter: isEliminated ? 'grayscale(0.8) blur(0.5px)' : 'grayscale(0) blur(0px)',
      }}
      transition={{
        layout: reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 22 },
        height: reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 180, damping: 22 },
        y: reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 18 },
        x: { duration: reduceMotion ? 0 : 0.24 },
      }}
      className={`relative flex min-w-0 flex-1 flex-col items-center justify-end ${
        isBattleMode ? 'max-w-[48px]' : 'max-w-[64px]'
      }`}
    >
      <AnimatePresence>
        {(isComparing || isSwapping || isFound || isPivot) && (
          <motion.span
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.92 }}
            className="absolute -top-8 z-20 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-2 py-1 font-mono text-[8px] font-black uppercase tracking-[0.18em] text-white shadow-2xl backdrop-blur"
            style={{ color: tone }}
          >
            {isFound ? 'found' : isPivot ? 'pivot' : isSwapping ? 'swap' : 'check'}
          </motion.span>
        )}
      </AnimatePresence>

      <div
        className={`relative flex w-full items-center justify-center border border-white/15 shadow-[0_18px_40px_rgba(0,0,0,0.38)] ${
          scene.mode === 'avatars'
            ? 'h-16 rounded-full sm:h-20 overflow-hidden'
            : scene.mode === 'cards'
              ? 'rounded-2xl overflow-visible'
              : scene.mode === 'remote'
                ? 'rounded-full overflow-hidden'
                : 'rounded-t-[1.35rem] overflow-visible'
        }`}
        style={{
          height: scene.mode === 'avatars' ? undefined : '100%',
          background: actorBackground(scene.mode, tone, isComparing, isSwapping, isSorted, isEliminated),
          boxShadow: isComparing || isSwapping || isFound
            ? `0 0 30px ${tone}66, 0 18px 40px rgba(0,0,0,0.38)`
            : '0 18px 40px rgba(0,0,0,0.38)',
        }}
      >
        {scene.mode === 'avatars' ? (
          <PartyAvatar value={value} isComparing={isComparing} isSwapping={isSwapping} isSorted={isSorted} tone={tone} />
        ) : (
          <>
            <span className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent" />
            <span className="relative z-10 rounded-full bg-black/40 px-2 py-1 font-mono text-[10px] font-black text-white shadow-lg backdrop-blur-md sm:text-xs">
              {label}
            </span>
          </>
        )}
      </div>

      <span className="mt-2 font-mono text-[9px] font-black text-[var(--muted)]">{index}</span>
    </motion.div>
  )
}

function PartyAvatar({
  value,
  isComparing,
  isSwapping,
  isSorted,
  tone,
}: {
  value: number
  isComparing: boolean
  isSwapping: boolean
  isSorted: boolean
  tone: string
}) {
  const face = isSorted ? ':)' : isSwapping ? ':O' : isComparing ? ':D' : ':)'

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[10px] font-black text-white sm:h-12 sm:w-12" style={{ backgroundColor: tone }}>
        {face}
      </div>
      <span className="mt-1 font-mono text-[8px] font-black text-white/65">{value}</span>
    </div>
  )
}

function ArrayTensionLayer({
  activeIndices,
  count,
  scene,
  reduceMotion,
}: {
  activeIndices: number[]
  count: number
  scene: ArrayScene
  reduceMotion: boolean
}) {
  if (activeIndices.length < 2 || count <= 1) return null

  const [first, second] = activeIndices
  const min = Math.min(first, second)
  const max = Math.max(first, second)
  
  const left = `${((min + 0.5) / count) * 100}%`
  const right = `${(1 - (max + 0.5) / count) * 100}%`

  return (
    <motion.div
      className="pointer-events-none absolute bottom-[46%] z-20 h-1 rounded-full"
      style={{
        left,
        right,
        background: `linear-gradient(90deg, ${scene.primary}, ${scene.secondary})`,
        boxShadow: `0 0 28px ${scene.primary}66`,
      }}
      animate={reduceMotion ? undefined : { scaleY: [1, 2.4, 1], opacity: [0.35, 1, 0.35] }}
      transition={{ duration: 0.55, repeat: Infinity }}
    />
  )
}

function StepNarration({
  step,
  isFocusMode = false,
}: {
  step: AlgorithmStep
  isFocusMode?: boolean
}) {
  return (
    <div className={`absolute z-30 rounded-[1.4rem] border border-[var(--border)] bg-[var(--card)]/80 px-4 py-3 text-[var(--ink)] shadow-2xl backdrop-blur-xl transition-all duration-500 ${
      isFocusMode ? 'inset-x-6 bottom-6 sm:inset-x-10 sm:bottom-10 p-4' : 'inset-x-3 bottom-3 sm:inset-x-5 sm:bottom-5'
    }`} role="status" aria-live="polite">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-[9px] font-black uppercase tracking-[0.24em] text-[var(--accent)]">line {step.codeLine}</span>
        <span className="hidden h-1.5 w-1.5 rounded-full bg-[var(--border)] sm:block" />
        <p className="text-xs font-black uppercase tracking-widest text-[var(--ink)] sm:text-sm">{step.description}</p>
      </div>
    </div>
  )
}

function actorLabel(mode: ArrayScene['mode'], value: number, index: number) {
  if (mode === 'cards') return value
  if (mode === 'remote') return `#${index}`
  if (mode === 'factory') return value
  if (mode === 'pivot') return value
  if (mode === 'spotlight') return value
  if (mode === 'scanner') return value
  return value
}

function actorLift(
  mode: ArrayScene['mode'],
  value: number,
  maxValue: number,
  isComparing: boolean,
  isSwapping: boolean,
  isPivot: boolean,
  isFound: boolean
) {
  if (isFound) return -28
  if (isSwapping) return -22
  if (isPivot) return -18
  if (isComparing) return -12
  if (mode === 'avatars') return Math.max(0, 38 - (value / maxValue) * 30)
  if (mode === 'cards') return -(value / maxValue) * 8
  return 0
}

function actorRotate(mode: ArrayScene['mode'], isComparing: boolean, isSwapping: boolean, isPivot: boolean, index: number) {
  if (isSwapping) return index % 2 ? 6 : -6
  if (isPivot) return 0
  if (isComparing) return index % 2 ? 2 : -2
  if (mode === 'cards') return (index % 3) - 1
  return 0
}

function actorBackground(
  mode: ArrayScene['mode'],
  tone: string,
  isComparing: boolean,
  isSwapping: boolean,
  isSorted: boolean,
  isEliminated: boolean
) {
  if (isEliminated) return 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))'
  const base = isSorted ? '#10b981' : tone
  if (mode === 'cards') return `linear-gradient(155deg, rgba(255,255,255,0.34), ${base} 38%, rgba(0,0,0,0.45))`
  if (mode === 'remote') return `radial-gradient(circle at 50% 10%, rgba(255,255,255,0.32), transparent 24%), linear-gradient(180deg, ${base}, rgba(0,0,0,0.55))`
  if (isSwapping) return `linear-gradient(180deg, #fff, ${base} 22%, rgba(0,0,0,0.7))`
  if (isComparing) return `linear-gradient(180deg, rgba(255,255,255,0.38), ${base})`
  return `linear-gradient(180deg, rgba(255,255,255,0.18), ${base} 64%, rgba(0,0,0,0.46))`
}

function isBinaryEliminated(algorithmId: AlgorithmId, step: AlgorithmStep, index: number) {
  if (algorithmId !== 'binary-search') return false
  const active = step.state.highlightedIndices || step.state.comparingIndices || []
  if (active.length === 0 || step.state.foundIndex === index) return false
  const min = Math.min(...active)
  const max = Math.max(...active)
  return index < min || index > max
}

function CanvasControlButton({ children, onClick, title }: { children: React.ReactNode; onClick: (e: React.MouseEvent) => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)]/80 text-[var(--muted)] backdrop-blur-md transition-all hover:bg-[var(--card)] hover:text-[var(--ink)] active:scale-95 shadow-sm"
    >
      {children}
    </button>
  )
}
