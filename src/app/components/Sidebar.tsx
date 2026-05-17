'use client'

import React from 'react'
import { AlgorithmId } from '../types'
import { ALGORITHM_REGISTRY, CATEGORIES } from '../data/registry'
import { ChevronRight, BarChart, Search, Share2, Cpu, Brain, IconProps } from './Icons'

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  'bar-chart': BarChart,
  'search': Search,
  'share-2': Share2,
  'cpu': Cpu,
  'brain': Brain
}

interface SidebarProps {
  selectedId: AlgorithmId
  secondId?: AlgorithmId
  isBattleMode: boolean
  onSelect: (id: AlgorithmId) => void
  onSelectSecond: (id: AlgorithmId) => void
}

export function Sidebar({ selectedId, secondId, isBattleMode, onSelect, onSelectSecond }: SidebarProps) {
  const selected = ALGORITHM_REGISTRY[selectedId]

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-[var(--border)]/50 bg-[var(--card)] text-[var(--ink)] shadow-[var(--shadow-premium)] backdrop-blur-xl">
      {/* HEADER */}
      <div className="border-b border-[var(--border)] p-5">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">algorithms</p>
        <h2 className="mt-2 text-xl font-black tracking-[-0.03em]">Select an algorithm</h2>
        <p className="mt-2 text-xs font-semibold leading-5 text-[var(--muted)]">
          Current lab: <span className="text-[var(--accent)]">{selected.label}</span>
        </p>
      </div>

      {/* LIST - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {CATEGORIES.map((category) => {
          const algos = Object.values(ALGORITHM_REGISTRY).filter((a) => a.categoryId === category.id)
          const Icon = ICON_MAP[category.icon] || Cpu

          return (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between px-2 pb-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                    {Icon && <Icon size={14} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[10px] font-black uppercase tracking-widest text-[var(--ink)]">{category.label}</h3>
                  </div>
                </div>
                <span className="rounded-full bg-[var(--border)] px-1.5 py-0.5 font-mono text-[8px] font-black text-[var(--muted)]">{algos.length}</span>
              </div>

              <div className="flex flex-col gap-1">
                {algos.map((algorithm) => {
                  const isSelected = selectedId === algorithm.id || (isBattleMode && secondId === algorithm.id)
                  const isPrimary = selectedId === algorithm.id
                  const isSecondary = isBattleMode && secondId === algorithm.id
                  const isDifferentCategory = isBattleMode && selected.categoryId !== algorithm.categoryId
                  
                  return (
                    <button
                      type="button"
                      key={algorithm.id}
                      disabled={isDifferentCategory && false} // We allow clicking different categories to switch the battle context
                      onClick={() => {
                        if (isBattleMode) {
                          if (algorithm.categoryId === selected.categoryId) {
                            onSelectSecond(algorithm.id)
                          } else {
                            // Switch primary and reset battle to this new category
                            onSelect(algorithm.id)
                            onSelectSecond(algorithm.id)
                          }
                        } else {
                          onSelect(algorithm.id)
                        }
                      }}
                      className={`group relative w-full rounded-xl p-3 text-left transition-all active:scale-[0.98] ${
                        isSelected 
                          ? isPrimary ? 'bg-[var(--accent)] text-white shadow-md' : 'bg-[var(--muted)] text-white shadow-sm'
                          : isDifferentCategory 
                            ? 'opacity-40 hover:opacity-100 hover:bg-[var(--ink)]/[0.03]'
                            : 'hover:bg-[var(--ink)]/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-black ${isSelected ? 'text-white' : 'text-[var(--ink)]'}`}>{algorithm.label}</p>
                          <p className={`mt-0.5 truncate font-mono text-[8px] font-black uppercase tracking-wider ${isSelected ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                            {algorithm.timeComplexity}
                          </p>
                        </div>
                        {isPrimary && <span className="rounded-md bg-white/20 px-1.5 py-0.5 font-mono text-[7px] font-black uppercase text-white">Left</span>}
                        {isSecondary && <span className="rounded-md bg-black/20 px-1.5 py-0.5 font-mono text-[7px] font-black uppercase text-white">Right</span>}
                        {!isSelected && <ChevronRight size={14} className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${isSelected ? 'text-white' : 'text-[var(--border)]'}`} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
