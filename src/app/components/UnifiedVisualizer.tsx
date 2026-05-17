'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlgorithmId, AlgorithmStep, VisualType } from '../types'
import { VisualizerCanvas } from './VisualizerCanvas'
import { GraphCanvas } from './GraphCanvas'
import { ZoomIn, ZoomOut, RotateCcw } from './Icons'

interface UnifiedVisualizerProps {
  step: AlgorithmStep | null
  algorithmId: AlgorithmId
  visualType: VisualType
  label: string
  accentColor?: string
  isBattleMode?: boolean
  isFocusMode?: boolean
}

export function UnifiedVisualizer({ 
  step, 
  algorithmId,
  visualType, 
  label, 
  accentColor = '#22d3ee',
  isBattleMode = false,
  isFocusMode = false,
}: UnifiedVisualizerProps) {
  if (!step) return <VisualizerCanvas step={null} isBattleMode={isBattleMode} isFocusMode={isFocusMode} />

  switch (visualType) {
    case 'array':
      return <VisualizerCanvas step={step} algorithmId={algorithmId} label={label} accentColor={accentColor} isBattleMode={isBattleMode} isFocusMode={isFocusMode} />
    
    case 'graph':
      return (
        <div className={`relative flex min-h-[var(--min-h-viz)] flex-1 flex-col overflow-hidden text-[var(--ink)] transition-all duration-500 sm:min-h-[480px] border-[var(--border)] bg-[var(--canvas-bg)] ${
          isFocusMode ? 'rounded-none border-0 p-6 sm:p-10 shadow-none' : 'rounded-[2rem] border p-4 shadow-[0_30px_120px_rgba(0,0,0,0.1)] sm:p-6'
        } ${isBattleMode ? 'sm:p-4' : ''}`}>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'linear-gradient(90deg, var(--border) 1px, transparent 1px), linear-gradient(var(--border) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(56,189,248,0.1),transparent_40%),radial-gradient(circle_at_78%_72%,rgba(168,85,247,0.08),transparent_40%)]" />
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">{label}</p>
              <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">{graphSceneTitle(algorithmId)}</h3>
              <p className="mt-1 max-w-xl text-xs font-semibold leading-5 text-[var(--muted)]/60 sm:text-sm">{graphSceneDescription(algorithmId)}</p>
            </div>
            <div className={`rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 px-3 py-2 text-right font-mono text-[9px] font-black uppercase text-[var(--muted)]/50 backdrop-blur ${
              isBattleMode ? 'tracking-[0.05em]' : 'tracking-[0.2em]'
            }`}>
              <div className="text-[var(--accent)]">line {step.codeLine}</div>
              <div className="text-[var(--ink)]/40">{graphMode(algorithmId)}</div>
            </div>
          </div>
          <div className="relative z-10 flex-1 pb-24 pt-4 sm:pb-28">
            <GraphCanvas step={step} algorithmId={algorithmId} />
          </div>
          <StepNarration step={step} algorithmId={algorithmId} isFocusMode={isFocusMode} />
        </div>
      )

    case 'grid':
      return <GridCanvas step={step} label={label} algorithmId={algorithmId} isBattleMode={isBattleMode} isFocusMode={isFocusMode} />

    case 'scatter':
      return <ScatterCanvas step={step} label={label} algorithmId={algorithmId} isBattleMode={isBattleMode} isFocusMode={isFocusMode} />

    default:
      return <VisualizerCanvas step={step} algorithmId={algorithmId} label={label} accentColor={accentColor} />
  }
}

function GridCanvas({
  step,
  label,
  algorithmId,
  isBattleMode,
  isFocusMode,
}: {
  step: AlgorithmStep
  label: string
  algorithmId: AlgorithmId
  isBattleMode: boolean
  isFocusMode: boolean
}) {
  const grid = step.state.grid || []
  const isQueens = algorithmId === 'n-queens'
  const isFibonacci = algorithmId === 'fibonacci'
  
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 10))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.1))
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
        isFocusMode ? 'rounded-none border-0 p-6 sm:p-10 shadow-none' : 'rounded-[2rem] border p-4 shadow-[0_30px_120px_rgba(0,0,0,0.1)] sm:p-6'
      } ${isQueens ? 'border-violet-300/20 bg-[var(--canvas-bg)]' : 'border-[var(--border)] bg-[var(--canvas-bg)]'} ${isDragging ? 'cursor-grabbing touch-none' : 'cursor-grab touch-pan-y'}`}
    >
      <div className={`absolute z-40 flex flex-col gap-2 transition-all duration-500 ${isFocusMode ? 'right-6 top-32 sm:right-10 sm:top-40' : 'right-4 top-24'}`}>
        <CanvasControlButton onClick={handleZoomIn} title="Zoom In"><ZoomIn size={14} /></CanvasControlButton>
        <CanvasControlButton onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={14} /></CanvasControlButton>
        <CanvasControlButton onClick={handleReset} title="Reset View"><RotateCcw size={14} /></CanvasControlButton>
      </div>

      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-white/50">{label}</p>
          <h3 className={`mt-2 font-black tracking-[-0.03em] text-white ${
            isBattleMode ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
          }`}>
            {isQueens ? 'N-Queens Backtracking' : 'Fibonacci Memoization'}
          </h3>
          <p className={`mt-1 max-w-xl font-semibold leading-5 text-white/60 ${
            isBattleMode ? 'hidden sm:block text-[10px]' : 'text-xs sm:text-sm'
          }`}>
            {isQueens
              ? 'Place queens so none can attack each other — backtrack when stuck.'
              : 'Each cell stores a computed value so the same subproblem is never solved twice.'}
          </p>
        </div>
        <div className={`rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-right font-mono text-[9px] font-black uppercase text-white/50 backdrop-blur ${
          isBattleMode ? 'tracking-[0.05em]' : 'tracking-[0.2em]'
        }`}>
          <div className={isQueens ? 'text-violet-200' : 'text-amber-200'}>line {step.codeLine}</div>
          <div>{isQueens ? 'constraint grid' : 'memo stack'}</div>
        </div>
      </div>
      
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-hidden p-8 pb-24 pt-10 sm:p-12 sm:pb-28">
        <motion.div
          animate={{
            scale: zoom,
            x: pan.x,
            y: pan.y
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`relative grid gap-2 sm:gap-4 p-8 ${isQueens ? 'rounded-2xl border border-violet-300/20 bg-violet-950/20 p-6 shadow-[0_0_60px_rgba(139,92,246,0.16)]' : ''}`}
          style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 1}, minmax(0, 1fr))` }}
        >
          {isQueens && <QueenLaserLayer grid={grid} />}
          {grid.map((row, y) => row.map((cell, x) => (
            <motion.div
              key={`${x}-${y}`}
              layout
              className={`flex items-center justify-center rounded-xl border font-mono text-[10px] font-black transition-colors ${
                isBattleMode ? 'h-8 w-8 sm:h-10 sm:w-10' : 'h-10 w-10 sm:h-14 sm:w-14 sm:text-sm'
              } ${isFibonacci ? 'border-amber-300/30 text-amber-600 dark:text-amber-200' : 'border-[var(--border)] text-[var(--ink)]'}`}
              animate={{
                backgroundColor: isQueens
                  ? cell === 'Q' ? '#8b5cf6' : cell ? 'rgba(244,63,94,0.22)' : 'rgba(255,255,255,0.03)'
                  : cell !== null ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.03)',
                borderColor: isQueens
                  ? cell ? 'rgba(216,180,254,0.75)' : 'rgba(255,255,255,0.08)'
                  : cell !== null ? 'rgba(251,191,36,0.45)' : 'rgba(255,255,255,0.08)',
                scale: cell !== null ? 1.1 : 1,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              {cell === 'Q' ? 'Q' : cell === 'X' ? '×' : cell !== null ? String(cell) : ''}
            </motion.div>
          )))}
        </motion.div>
      </div>
      <StepNarration step={step} algorithmId={algorithmId} isFocusMode={isFocusMode} />
    </div>
  )
}

function ScatterCanvas({ 
  step, 
  label, 
  algorithmId, 
  isBattleMode,
  isFocusMode
}: { 
  step: AlgorithmStep
  label: string
  algorithmId: AlgorithmId
  isBattleMode: boolean
  isFocusMode: boolean
}) {
  const points = step.state.points || []
  const centroids = step.state.centroids || []
  const line = step.state.line
  const isRegression = algorithmId === 'linear-regression'

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 10))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.1))
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
      className={`relative flex min-h-[var(--min-h-viz)] flex-1 flex-col overflow-hidden text-[var(--ink)] transition-all duration-500 sm:min-h-[480px] bg-[var(--canvas-bg)] ${
      isFocusMode ? 'rounded-none border-0 p-6 sm:p-10 shadow-none' : 'rounded-[2rem] border border-[var(--border)] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.1)] sm:p-6'
    } ${isBattleMode ? 'sm:p-4' : ''} ${isDragging ? 'cursor-grabbing touch-none' : 'cursor-grab touch-pan-y'}`}
    >
      <div className={`absolute z-40 flex flex-col gap-2 transition-all duration-500 ${isFocusMode ? 'right-6 top-32 sm:right-10 sm:top-40' : 'right-4 top-24'}`}>
        <CanvasControlButton onClick={handleZoomIn} title="Zoom In"><ZoomIn size={14} /></CanvasControlButton>
        <CanvasControlButton onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={14} /></CanvasControlButton>
        <CanvasControlButton onClick={handleReset} title="Reset View"><RotateCcw size={14} /></CanvasControlButton>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(45,212,191,0.16),transparent_34%),radial-gradient(circle_at_80%_76%,rgba(244,114,182,0.14),transparent_34%)]" />
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-white/50">{label}</p>
          <h3 className={`mt-2 font-black tracking-[-0.03em] text-white ${
            isBattleMode ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
          }`}>
            {isRegression ? 'Linear Regression' : 'K-Means Clustering'}
          </h3>
          <p className={`mt-1 max-w-xl font-semibold leading-5 text-white/60 ${
            isBattleMode ? 'hidden sm:block text-[10px]' : 'text-xs sm:text-sm'
          }`}>
            {isRegression
              ? 'Gradient descent nudges the line closer to every point each epoch.'
              : 'Centroids migrate toward the mean of their cluster until convergence.'}
          </p>
        </div>
        <div className={`rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-right font-mono text-[9px] font-black uppercase text-white/50 backdrop-blur ${
          isBattleMode ? 'tracking-[0.05em]' : 'tracking-[0.2em]'
        }`}>
          <div className="text-teal-200">line {step.codeLine}</div>
          <div>{isRegression ? 'loss lab' : 'cluster lab'}</div>
        </div>
      </div>
      <div className="relative z-10 m-2 flex-1 pb-24 pt-4 sm:m-4 sm:pb-28 overflow-hidden">
        <motion.div
          animate={{
            scale: zoom,
            x: pan.x,
            y: pan.y
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full h-full p-12 sm:p-20"
        >
          <svg viewBox="-10 -10 120 120" className="w-full h-full overflow-visible">
            <defs>
              <filter id={`scatter-glow-${algorithmId}`}>
                <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {points.map((p, i) => (
              <g key={i}>
                {isRegression && line && (
                  <motion.line
                    x1={p.x}
                    y1={100 - p.y}
                    x2={p.x}
                    y2={100 - regressionY(line, p.x)}
                    stroke="#fb7185"
                    strokeWidth={0.22}
                    strokeDasharray="1 1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.28 }}
                  />
                )}
                <motion.circle
                  cx={p.x}
                  cy={100 - p.y}
                  r={isRegression ? 1.55 : 1.9}
                  filter={`url(#scatter-glow-${algorithmId})`}
                  initial={false}
                  animate={{
                    fill: p.cluster !== undefined ? `hsl(${p.cluster * 118 + 18}, 82%, 58%)` : '#ffffff',
                    opacity: 0.72,
                  }}
                  transition={{ duration: 0.4 }}
                />
              </g>
            ))}
            {centroids.map((c, i) => (
              <motion.path
                key={`c-${i}`}
                stroke={`hsl(${c.cluster * 118 + 18}, 90%, 70%)`}
                strokeWidth={1.1}
                strokeLinecap="round"
                animate={{ 
                  opacity: 1,
                  d: `M ${c.x - 3} ${100 - c.y - 3} L ${c.x + 3} ${100 - c.y + 3} M ${c.x - 3} ${100 - c.y + 3} L ${c.x + 3} ${100 - c.y - 3}`
                }}
                transition={{ d: { type: 'spring', stiffness: 100, damping: 20 } }}
              />
            ))}
            {line && (
              <motion.line
                stroke={isRegression ? '#facc15' : '#ef4444'}
                strokeWidth={isRegression ? 0.8 : 0.5}
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  x1: line.x1,
                  y1: 100 - line.y1,
                  x2: line.x2,
                  y2: 100 - line.y2
                }}
                transition={{ duration: 0.55 }}
              />
            )}
          </svg>
        </motion.div>
      </div>
      <StepNarration step={step} algorithmId={algorithmId} />
    </div>
  )
}

function StepNarration({ step, algorithmId, isFocusMode = false }: { step: AlgorithmStep; algorithmId: AlgorithmId; isFocusMode?: boolean }) {
  return (
    <div className={`absolute z-30 rounded-[1.4rem] border border-[var(--border)] bg-[var(--card)]/80 px-4 py-3 text-[var(--ink)] shadow-2xl backdrop-blur-xl transition-all duration-500 ${
      isFocusMode ? 'inset-x-6 bottom-6 sm:inset-x-10 sm:bottom-10 p-4' : 'inset-x-3 bottom-3 sm:inset-x-5 sm:bottom-5'
    }`} role="status" aria-live="polite">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-[9px] font-black uppercase tracking-[0.24em] text-[var(--accent)]">line {step.codeLine}</span>
        <span className="hidden h-1 w-1 rounded-full bg-[var(--border)] sm:block" />
        <p className="text-xs font-semibold leading-5 text-[var(--ink)]/80 sm:text-sm">{algoDescription(step.description, algorithmId)}</p>
      </div>
    </div>
  )
}

function algoDescription(description: string, algorithmId: AlgorithmId) {
  if (algorithmId === 'n-queens' && description.includes('Conflict')) return 'Laser alarm. That square is under attack.'
  if (algorithmId === 'bfs' && description.includes('Queue')) return description.replace('Queue', 'Wave queue')
  if (algorithmId === 'dfs' && description.includes('Backtracking')) return 'Dead end. The cave diver backs out and tries another tunnel.'
  if (algorithmId === 'dijkstra' && description.includes('Updated')) return 'Traffic control found a cheaper route and rewired the signs.'
  if (algorithmId === 'bellman-ford' && description.includes('Relaxed')) return 'The edge audit found a cheaper receipt and updated the ledger.'
  if (algorithmId === 'a-star' && description.includes('fScore')) return 'GPS math: real distance plus a hunch about the finish line.'
  if (algorithmId === 'k-means' && description.includes('centroids')) return 'The cluster magnets move to the center of their tiny social circles.'
  if (algorithmId === 'linear-regression' && description.includes('Error')) return 'The line takes the criticism personally and tilts a little.'
  return description
}

function QueenLaserLayer({ grid }: { grid: (number | string | null)[][] }) {
  const queens = grid.flatMap((row, y) =>
    row.map((cell, x) => (cell === 'Q' ? { x, y } : null)).filter(Boolean) as { x: number; y: number }[]
  )
  const columns = grid[0]?.length || 1
  const rows = grid.length || 1

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {queens.map((queen, index) => (
        <React.Fragment key={`${queen.x}-${queen.y}-${index}`}>
          <span
            className="absolute h-px w-full bg-violet-300/20 shadow-[0_0_18px_rgba(216,180,254,0.45)]"
            style={{ top: `${((queen.y + 0.5) / rows) * 100}%` }}
          />
          <span
            className="absolute w-px h-full bg-violet-300/20 shadow-[0_0_18px_rgba(216,180,254,0.45)]"
            style={{ left: `${((queen.x + 0.5) / columns) * 100}%` }}
          />
        </React.Fragment>
      ))}
    </div>
  )
}

function regressionY(line: NonNullable<AlgorithmStep['state']['line']>, x: number) {
  const slope = (line.y2 - line.y1) / Math.max(1, line.x2 - line.x1)
  return line.y1 + slope * (x - line.x1)
}

function graphSceneTitle(algorithmId: AlgorithmId) {
  if (algorithmId === 'bfs') return 'Breadth-First Search'
  if (algorithmId === 'dfs') return 'Depth-First Search'
  if (algorithmId === 'dijkstra') return "Dijkstra's Shortest Path"
  if (algorithmId === 'bellman-ford') return 'Bellman-Ford'
  if (algorithmId === 'a-star') return 'A* Search'
  return 'Graph Traversal'
}

function graphSceneDescription(algorithmId: AlgorithmId) {
  if (algorithmId === 'bfs') return 'Explores all neighbors at the current depth before going deeper.'
  if (algorithmId === 'dfs') return 'Dives as deep as possible along one branch before backtracking.'
  if (algorithmId === 'dijkstra') return 'Greedily selects the lowest-cost unvisited node to find shortest paths.'
  if (algorithmId === 'bellman-ford') return 'Relaxes every edge V−1 times — handles negative weights correctly.'
  if (algorithmId === 'a-star') return 'Combines real cost and a heuristic estimate to find the optimal path fast.'
  return 'Nodes, edges, and paths pulse in sync with the code line.'
}

function graphMode(algorithmId: AlgorithmId) {
  if (algorithmId === 'bfs') return 'queue wave'
  if (algorithmId === 'dfs') return 'depth dive'
  if (algorithmId === 'dijkstra') return 'route cost'
  if (algorithmId === 'bellman-ford') return 'edge audit'
  if (algorithmId === 'a-star') return 'heuristic'
  return 'graph'
}

function CanvasControlButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/60 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white active:scale-95"
    >
      {children}
    </button>
  )
}
