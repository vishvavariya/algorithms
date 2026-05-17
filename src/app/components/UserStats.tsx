'use client'

import React from 'react'
import { useUserStats } from '../hooks/useUserStats'
import { User, BarChart } from './Icons'

export function UserStats() {
  const { activeUsers, totalVisits } = useUserStats()

  return (
    <div className="flex items-center gap-2 rounded-xl bg-[var(--accent)]/5 p-3">
      <div className="flex flex-1 items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
          <User size={14} />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Active Now</p>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-black text-[var(--ink)]">{activeUsers}</p>
            <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
        </div>
      </div>

      <div className="h-8 w-px bg-[var(--border)]/50" />

      <div className="flex flex-1 items-center gap-2.5 pl-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ink)]/5 text-[var(--muted)]">
          <BarChart size={14} />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Total Lab Hits</p>
          <p className="text-sm font-black text-[var(--ink)]">{totalVisits.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
