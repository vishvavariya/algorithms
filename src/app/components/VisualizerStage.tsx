'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlgorithmStep, VisualType } from '../types'
import { GraphCanvas } from './GraphCanvas'
import { VisualizerCanvas } from './VisualizerCanvas'

interface VisualizerStageProps {
  step: AlgorithmStep | null
  visualType: VisualType
}

export function VisualizerStage({ step, visualType }: VisualizerStageProps) {
  if (!step) {
    return (
      <div className="flex items-center justify-center h-full text-black/20 dark:text-white/20 font-bold uppercase tracking-widest">
        Select an algorithm to start
      </div>
    )
  }

  const { state } = step

  if (visualType === 'graph') {
    return (
      <div className="relative w-full h-full flex flex-col">
        <div className="flex-1 p-8">
          <GraphCanvas nodes={state.nodes || []} edges={state.edges || []} />
        </div>
        <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
          <p className="text-sm font-medium text-black/60 dark:text-white/60 italic">
            {step.description}
          </p>
        </div>
      </div>
    )
  }

  if (visualType === 'scatter') {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    return (
      <div className="relative w-full h-full flex flex-col">
        <div className="flex-1 relative p-12">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {state.points?.map((p, i) => (
              <motion.circle
                key={`p-${i}`}
                cx={p.x}
                cy={p.y}
                r={1.5}
                animate={{ fill: p.cluster !== undefined ? colors[p.cluster % colors.length] : '#cbd5e1' }}
                className="transition-colors duration-500"
              />
            ))}
            {state.centroids?.map((c, i) => (
              <motion.path
                key={`c-${i}`}
                d="M-2 -2 L2 2 M-2 2 L2 -2"
                transform={`translate(${c.x}, ${c.y})`}
                stroke={colors[c.cluster % colors.length]}
                strokeWidth={1}
                animate={{ x: c.x, y: c.y }}
                transition={{ type: 'spring', stiffness: 100 }}
              />
            ))}
            {state.line && (
              <motion.line
                x1={state.line.x1}
                y1={state.line.y1}
                x2={state.line.x2}
                y2={state.line.y2}
                stroke="#3b82f6"
                strokeWidth={0.5}
                animate={{ x1: state.line.x1, y1: state.line.y1, x2: state.line.x2, y2: state.line.y2 }}
                className="transition-all duration-300"
              />
            )}
          </svg>
        </div>
        <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
          <p className="text-sm font-medium text-black/60 dark:text-white/60 italic">
            {step.description}
          </p>
        </div>
      </div>
    )
  }

  if (visualType === 'grid') {
    return (
      <div className="relative w-full h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-12">
          <div 
            className="grid gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl"
            style={{ 
              gridTemplateColumns: `repeat(${state.grid?.[0]?.length || 0}, 1fr)`,
            }}
          >
            {state.grid?.map((row, r) => (
              row.map((cell, c) => (
                <motion.div
                  key={`${r}-${c}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg text-lg font-black transition-colors duration-300 ${
                    cell === 'Q' 
                      ? 'bg-blue-500 text-white' 
                      : cell === 'X' 
                      ? 'bg-red-500 text-white'
                      : 'bg-white dark:bg-[#2a2a2a] text-black dark:text-white'
                  }`}
                >
                  {cell === 'Q' ? '♛' : cell === 'X' ? '×' : cell}
                </motion.div>
              ))
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
          <p className="text-sm font-medium text-black/60 dark:text-white/60 italic">
            {step.description}
          </p>
        </div>
      </div>
    )
  }

  return (
    <VisualizerCanvas 
      step={step} 
      label={visualType === 'array' ? 'Linear Structure' : 'Visualizer'} 
      showMetrics={false} 
    />
  )
}
