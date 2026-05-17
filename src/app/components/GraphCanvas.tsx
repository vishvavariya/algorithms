'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AlgorithmId, AlgorithmStep, GraphNode } from '../types'
import { ZoomIn, ZoomOut, RotateCcw } from './Icons'

export interface GraphCanvasProps {
  step?: AlgorithmStep
  algorithmId?: AlgorithmId
  nodes?: NonNullable<AlgorithmStep['state']['nodes']>
  edges?: NonNullable<AlgorithmStep['state']['edges']>
}

const GRAPH_ACCENTS: Record<string, { primary: string; secondary: string; idle: string }> = {
  bfs: { primary: '#38bdf8', secondary: '#a3e635', idle: '#94a3b8' },
  dfs: { primary: '#a855f7', secondary: '#f472b6', idle: '#c4b5fd' },
  dijkstra: { primary: '#f59e0b', secondary: '#34d399', idle: '#fde68a' },
  'bellman-ford': { primary: '#fb7185', secondary: '#fbbf24', idle: '#fecaca' },
  'a-star': { primary: '#22d3ee', secondary: '#fb7185', idle: '#bae6fd' },
}

export function GraphCanvas({ step, algorithmId = 'bfs', nodes: providedNodes, edges: providedEdges }: GraphCanvasProps) {
  const reduceMotion = useReducedMotion()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const nodes = providedNodes || step?.state.nodes || []
  const edges = providedEdges || step?.state.edges || []
  const accents = GRAPH_ACCENTS[algorithmId] || GRAPH_ACCENTS.bfs

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 10))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.1))
  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setLastPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    const vSize = 100 / zoom
    const rect = containerRef.current.getBoundingClientRect()
    const dx = ((e.clientX - lastPos.x) / rect.width) * vSize
    const dy = ((e.clientY - lastPos.y) / rect.height) * vSize
    setPan(prev => ({ x: prev.x - dx, y: prev.y - dy }))
    setLastPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => setIsDragging(false)

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp)
      return () => window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const vSize = (100 / zoom) * 1.15
  const vX = 50 - vSize / 2 + pan.x
  const vY = 50 - vSize / 2 + pan.y

  if (nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[260px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)]/20 px-4 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]/40">
        Graph data is preparing
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative h-full w-full select-none ${isDragging ? 'cursor-grabbing touch-none' : 'cursor-grab touch-pan-y'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onWheel={(e) => {
        if (e.ctrlKey || e.metaKey) {
          if (e.deltaY < 0) handleZoomIn()
          else handleZoomOut()
          e.preventDefault()
        }
      }}
    >
      <div className="absolute right-4 top-4 z-30 flex flex-col gap-2">
        <GraphControlButton onClick={handleZoomIn} title="Zoom In">
          <ZoomIn size={14} />
        </GraphControlButton>
        <GraphControlButton onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut size={14} />
        </GraphControlButton>
        <GraphControlButton onClick={handleReset} title="Reset View">
          <RotateCcw size={14} />
        </GraphControlButton>
      </div>

      <div className="absolute inset-0 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)]/40 backdrop-blur" />
      <div
        className="pointer-events-none absolute inset-4 rounded-[1.25rem] opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--muted) 0.5px, transparent 0.5px)',
          backgroundSize: '22px 22px',
        }}
      />
      <svg className="relative z-10 h-full w-full" viewBox={`${vX} ${vY} ${vSize} ${vSize}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id={`graph-glow-${algorithmId}`}>
            <feGaussianBlur stdDeviation="1.4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`node-fill-${algorithmId}`} cx="35%" cy="25%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="0.92" />
            <stop offset="42%" stopColor={accents.primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={accents.primary} stopOpacity="1" />
          </radialGradient>
        </defs>

        {edges.map((edge, index) => {
          const fromNode = nodes.find((node) => node.id === edge.from)
          const toNode = nodes.find((node) => node.id === edge.to)
          if (!fromNode || !toNode) return null

          const isVisiting = edge.state === 'visiting'
          const isVisited = edge.state === 'visited'
          const isPath = edge.state === 'path'
          const color = isPath ? accents.secondary : isVisiting ? accents.primary : accents.idle
          const opacity = isPath || isVisiting ? 0.95 : isVisited ? 0.42 : 0.18
          const edgePath = curvedEdgePath(fromNode, toNode, index)
          const midpoint = edgeMidpoint(fromNode, toNode, index)

          return (
            <g key={`edge-${index}`}>
              <motion.path
                d={edgePath}
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0.1 }}
                animate={{
                  pathLength: 1,
                  opacity,
                  stroke: color,
                  strokeWidth: isPath ? 1.35 : isVisiting ? 1 : 0.48,
                }}
                fill="none"
                transition={{ duration: reduceMotion ? 0 : 0.45 }}
                strokeLinecap="round"
                filter={isPath || isVisiting ? `url(#graph-glow-${algorithmId})` : undefined}
              />
              {(isPath || isVisiting) && !reduceMotion && (
                <motion.circle
                  r={1.1}
                  fill={color}
                  filter={`url(#graph-glow-${algorithmId})`}
                  initial={{ cx: fromNode.x, cy: fromNode.y, opacity: 0 }}
                  animate={{
                    cx: [fromNode.x, toNode.x],
                    cy: [fromNode.y, toNode.y],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 1, repeat: Infinity, delay: index * 0.08 }}
                />
              )}
              {edge.weight !== undefined && (
                <g>
                  <motion.rect
                    x={midpoint.x - 3.5}
                    y={midpoint.y - 4.8}
                    width="7"
                    height="4.4"
                    rx="1.6"
                    fill="var(--card)"
                    stroke={color}
                    strokeWidth="0.25"
                    animate={{ opacity: isVisiting || isPath ? 1 : 0.48 }}
                  />
                  <motion.text
                    x={midpoint.x}
                    y={midpoint.y - 1.6}
                    className="fill-[var(--ink)] font-mono text-[2.6px] font-black"
                    textAnchor="middle"
                    animate={{ opacity: isVisiting || isPath ? 1 : 0.56 }}
                  >
                    {edge.weight}
                  </motion.text>
                </g>
              )}
            </g>
          )
        })}

        {algorithmId === 'a-star' && (
          <motion.circle
            cx="84"
            cy="82"
            r="5"
            fill="none"
            stroke={accents.secondary}
            strokeWidth="0.5"
            strokeDasharray="1 2"
            animate={reduceMotion ? undefined : { r: [4, 8, 4], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}

        {nodes.map((node, index) => {
          const isVisiting = node.state === 'visiting'
          const isVisited = node.state === 'visited'
          const isPath = node.state === 'path'
          const isActive = isVisiting || isPath
          const fill = isPath ? accents.secondary : isVisiting ? `url(#node-fill-${algorithmId})` : isVisited ? 'var(--border)' : 'var(--card)'
          const stroke = isPath ? accents.primary : isVisiting ? accents.primary : isVisited ? 'var(--muted)' : 'var(--border)'

          return (
            <motion.g
              key={node.id}
              initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{
                scale: isActive ? 1.18 : 1,
                opacity: 1,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.22, delay: reduceMotion ? 0 : index * 0.02 }}
            >
              {isActive && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={7}
                  fill="none"
                  stroke={isPath ? accents.secondary : accents.primary}
                  strokeWidth={0.45}
                  animate={reduceMotion ? undefined : { r: [5, 9, 5], opacity: [0.18, 0.7, 0.18] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                />
              )}
              <NodeShape
                node={node}
                fill={fill}
                stroke={stroke}
                isActive={isActive}
                filter={isActive ? `url(#graph-glow-${algorithmId})` : undefined}
              />
              <text
                x={node.x}
                y={node.y}
                dy=".35em"
                className="pointer-events-none fill-[var(--ink)] font-mono text-[2.45px] font-black"
                textAnchor="middle"
              >
                {shortNodeLabel(node.label)}
              </text>
              {algorithmId === 'a-star' && node.label.includes('h=') && (
                <text
                  x={node.x}
                  y={node.y + 7.5}
                  className="pointer-events-none fill-cyan-100/70 font-mono text-[2px]"
                  textAnchor="middle"
                >
                  {node.label.match(/h=([^)]+)/)?.[1] || ''}
                </text>
              )}
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}

function shortNodeLabel(label: string) {
  return label.split(' ')[0]
}

function curvedEdgePath(fromNode: GraphNode, toNode: GraphNode, index: number) {
  const midX = (fromNode.x + toNode.x) / 2
  const midY = (fromNode.y + toNode.y) / 2
  const dx = toNode.x - fromNode.x
  const dy = toNode.y - fromNode.y
  const length = Math.max(1, Math.sqrt(dx * dx + dy * dy))
  const bend = ((index % 3) - 1) * 5
  const controlX = midX + (-dy / length) * bend
  const controlY = midY + (dx / length) * bend
  return `M ${fromNode.x} ${fromNode.y} Q ${controlX} ${controlY} ${toNode.x} ${toNode.y}`
}

function edgeMidpoint(fromNode: GraphNode, toNode: GraphNode, index: number) {
  const midX = (fromNode.x + toNode.x) / 2
  const midY = (fromNode.y + toNode.y) / 2
  const dx = toNode.x - fromNode.x
  const dy = toNode.y - fromNode.y
  const length = Math.max(1, Math.sqrt(dx * dx + dy * dy))
  const bend = ((index % 3) - 1) * 3
  return {
    x: midX + (-dy / length) * bend,
    y: midY + (dx / length) * bend,
  }
}

function NodeShape({
  node,
  fill,
  stroke,
  isActive,
  filter,
}: {
  node: GraphNode
  fill: string
  stroke: string
  isActive: boolean
  filter?: string
}) {
  return (
    <motion.circle
      cx={node.x}
      cy={node.y}
      r={4.2}
      animate={{ fill, stroke, strokeWidth: isActive ? 0.95 : 0.45 }}
      filter={filter}
    />
  )
}

function GraphControlButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)]/80 text-[var(--muted)] backdrop-blur-md transition-all hover:bg-[var(--card)] hover:text-[var(--ink)] active:scale-95 shadow-sm"
    >
      {children}
    </button>
  )
}
