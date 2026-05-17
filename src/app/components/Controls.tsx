'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward } from './Icons'

type PresetType = 'random' | 'reversed' | 'nearly' | 'duplicates'

interface ControlsProps {
  isPlaying: boolean
  isFinished: boolean
  speed: number
  currentIndex: number
  totalSteps: number
  data: number[]
  target: number
  showDataLab: boolean
  showTargetControl: boolean
  onTogglePlay: () => void
  onStep: () => void
  onStepBack: () => void
  onScrub: (index: number) => void
  onReset: () => void
  onPreset: (type: PresetType) => void
  onSpeedChange: (speed: number) => void
  onCustomInput: (values: number[]) => void
  onTargetChange: (target: number) => void
}

export function Controls({
  isPlaying,
  isFinished,
  speed,
  currentIndex,
  totalSteps,
  data,
  target,
  showDataLab,
  showTargetControl,
  onTogglePlay,
  onStep,
  onStepBack,
  onScrub,
  onReset,
  onPreset,
  onSpeedChange,
  onCustomInput,
  onTargetChange,
}: ControlsProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const [customDraft, setCustomDraft] = useState(data.join(', '))
  const [customError, setCustomError] = useState<string | null>(null)
  const progress = totalSteps > 1 ? currentIndex / (totalSteps - 1) : 0

  useEffect(() => {
    if (!isCustomOpen) setCustomDraft(data.join(', '))
  }, [data, isCustomOpen])

  const filmFrames = useMemo(() => {
    const frameCount = 18
    return Array.from({ length: frameCount }, (_, index) => {
      const frameProgress = index / (frameCount - 1)
      return {
        id: index,
        active: frameProgress <= progress,
        current: Math.abs(frameProgress - progress) < 1 / frameCount,
      }
    })
  }, [progress])

  const submitCustomData = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const tokens = customDraft
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    const values = tokens.map((value) => Number(value))

    if (values.some((value) => !Number.isFinite(value))) {
      setCustomError('Use numbers separated by commas.')
      return
    }

    if (values.length < 2) {
      setCustomError('Use at least two numbers.')
      return
    }

    if (values.length > 32) {
      setCustomError('Keep it to 32 numbers or fewer.')
      return
    }

    if (values.some((value) => value < 1 || value > 999)) {
      setCustomError('Numbers should be between 1 and 999.')
      return
    }

    setCustomError(null)
    onCustomInput(values)
    setIsCustomOpen(false)
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 p-4 text-slate-900 shadow-[0_22px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#090b10]/90 dark:text-white dark:shadow-[0_22px_80px_rgba(0,0,0,0.28)] sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_90%_100%,rgba(244,114,182,0.12),transparent_30%)]" />
      <div className="relative z-10 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/40">time travel</p>
              <p className="mt-1 text-sm font-black text-slate-900 dark:text-white sm:text-base">Step {Math.min(currentIndex + 1, totalSteps || 1)} of {totalSteps || 1}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className={`flex min-h-12 min-w-12 items-center justify-center rounded-2xl transition-all active:scale-95 ${
                  isPlaying
                    ? 'bg-slate-900 text-white shadow-[0_0_34px_rgba(0,0,0,0.18)] dark:bg-white dark:text-black dark:shadow-[0_0_34px_rgba(255,255,255,0.28)]'
                    : 'bg-cyan-500 text-white shadow-[0_0_34px_rgba(34,211,238,0.24)] hover:bg-cyan-400 dark:bg-cyan-300 dark:text-black dark:shadow-[0_0_34px_rgba(34,211,238,0.24)] dark:hover:bg-cyan-200'
                }`}
              >
                {isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" className="ml-0.5" />}
              </button>

              <div className="flex rounded-2xl border border-black/5 bg-black/[0.04] p-1 dark:border-white/10 dark:bg-white/[0.04]">
                <button
                  type="button"
                  onClick={onStepBack}
                  disabled={isPlaying || currentIndex === 0}
                  aria-label="Step Backward"
                  className="flex min-h-10 min-w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-black/[0.06] hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <RotateCcw size={16} className="-scale-x-100" />
                </button>
                <button
                  type="button"
                  onClick={onStep}
                  disabled={isPlaying || isFinished}
                  aria-label="Step Forward"
                  className="flex min-h-10 min-w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-black/[0.06] hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <SkipForward size={16} fill="currentColor" />
                </button>
              </div>

              <button
                type="button"
                onClick={onReset}
                aria-label="Reset Algorithm"
                className="flex min-h-12 min-w-12 items-center justify-center rounded-2xl border border-black/5 bg-black/[0.04] text-slate-600 transition hover:bg-black/[0.08] hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white active:scale-95"
                title="Reset"
              >
                <RotateCcw size={19} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-black/[0.04] p-3 dark:border-white/10 dark:bg-black/30">
            <div className="mb-3 flex gap-1.5 overflow-hidden" aria-hidden="true">
              {filmFrames.map((frame) => (
                <span
                  key={frame.id}
                  className={`h-8 flex-1 rounded-lg border transition-all ${
                    frame.current
                      ? 'border-cyan-400 bg-cyan-500 shadow-[0_0_24px_rgba(34,211,238,0.12)] dark:border-cyan-200 dark:bg-cyan-300 dark:shadow-[0_0_24px_rgba(34,211,238,0.35)]'
                      : frame.active
                        ? 'border-cyan-500/20 bg-cyan-500/10 dark:border-cyan-300/20 dark:bg-cyan-300/25'
                        : 'border-black/5 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.035]'
                  }`}
                />
              ))}
            </div>
            <input
              type="range"
              min="0"
              max={totalSteps > 0 ? totalSteps - 1 : 0}
              value={currentIndex}
              onChange={(event) => onScrub(parseInt(event.target.value))}
              aria-label="Timeline step"
              className="w-full cursor-pointer accent-cyan-500 dark:accent-cyan-300"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-black/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/40">speed</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-slate-600 dark:bg-white/10 dark:text-cyan-100">
              {speed <= 20 ? 'slow motion' : speed <= 50 ? 'study pace' : speed <= 85 ? 'fast' : 'chaos'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={(event) => onSpeedChange(parseInt(event.target.value))}
            aria-label="Playback speed"
            className="mt-4 w-full cursor-pointer accent-pink-500 dark:accent-pink-300"
          />
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-pink-500 dark:from-cyan-300 dark:via-lime-300 dark:to-pink-300" style={{ width: `${speed}%` }} />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        {showDataLab ? (
          <div className="min-w-0 rounded-2xl border border-black/5 bg-black/[0.03] p-3 dark:border-white/10 dark:bg-black/20">
            <div className="flex max-w-full items-center gap-2 overflow-x-auto">
              <span className="px-1 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/40 whitespace-nowrap">data lab</span>
              <PresetButton onClick={() => onPreset('random')}>Random</PresetButton>
              <PresetButton onClick={() => onPreset('reversed')}>Reversed</PresetButton>
              <PresetButton onClick={() => onPreset('nearly')}>Nearly Sorted</PresetButton>
              <PresetButton onClick={() => onPreset('duplicates')}>Duplicates</PresetButton>
              <button
                type="button"
                onClick={() => {
                  setIsCustomOpen((open) => !open)
                  setCustomError(null)
                }}
                className="min-h-11 rounded-xl border border-black/5 bg-black/[0.04] px-3 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:border-cyan-500/40 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/75 dark:hover:border-cyan-300/40 dark:hover:text-white active:scale-95 whitespace-nowrap"
                aria-expanded={isCustomOpen}
              >
                Custom
              </button>
            </div>

            {isCustomOpen && (
              <form onSubmit={submitCustomData} className="mt-3 rounded-2xl border border-black/5 bg-black/[0.04] p-3 dark:border-white/10 dark:bg-black/30">
                <label htmlFor="algorithm-custom-data" className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-white/50">
                  Custom dataset
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    id="algorithm-custom-data"
                    value={customDraft}
                    onChange={(event) => setCustomDraft(event.target.value)}
                    inputMode="numeric"
                    autoComplete="off"
                    className="min-h-11 flex-1 rounded-xl border border-black/10 bg-white px-3 text-base font-mono text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-white dark:text-black dark:focus:border-cyan-300"
                    placeholder="10, 20, 30"
                  />
                  <button
                    type="submit"
                    className="min-h-11 rounded-xl bg-slate-900 px-4 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-slate-800 dark:bg-cyan-300 dark:text-black dark:hover:bg-cyan-200 active:scale-95"
                  >
                    Apply
                  </button>
                </div>
                {customError && (
                  <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-200" role="alert">
                    {customError}
                  </p>
                )}
              </form>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-black/5 bg-black/[0.04] px-4 py-3 dark:border-white/10 dark:bg-black/20">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/40">built-in scenario</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 dark:text-white/60">This algorithm uses a prepared graph, board, stack, or point cloud so the lesson stays visible.</p>
          </div>
        )}

        {showTargetControl ? (
          <div className="rounded-2xl border border-black/5 bg-black/[0.04] p-3 dark:border-white/10 dark:bg-white/[0.04]">
            <label htmlFor="algorithm-target" className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-white/50">
              target
            </label>
            <input
              id="algorithm-target"
              type="number"
              min={1}
              max={999}
              value={target}
              onChange={(event) => {
                const nextTarget = Number(event.target.value)
                if (Number.isFinite(nextTarget)) onTargetChange(Math.max(1, Math.min(999, nextTarget)))
              }}
              inputMode="numeric"
              className="mt-2 min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-base font-black tabular-nums text-slate-900 outline-none transition focus:border-cyan-500 dark:border-white/10 dark:bg-black/30 dark:text-white dark:focus:border-cyan-300"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-black/5 bg-black/[0.04] p-3 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-white/50">focus</p>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500 dark:text-white/60">Step once, then watch which object lights up before touching Play.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PresetButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-xl border border-black/5 bg-black/[0.04] px-3 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:border-cyan-500/40 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/75 dark:hover:border-cyan-300/40 dark:hover:text-white active:scale-95 whitespace-nowrap"
    >
      {children}
    </button>
  )
}
