'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Info } from './Icons'

export interface TourStep {
  target: string // CSS selector, e.g. '[data-tour="play-controls"]'. Empty/null = centered modal.
  title: string
  body: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
}

interface TourGuideProps {
  isOpen: boolean
  steps: TourStep[]
  onClose: (completed: boolean) => void
  storageKey?: string
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

const PAD = 8
const TIP_W = 320
const TIP_H_EST = 180
const VP_MARGIN = 12

export function TourGuide({ isOpen, steps, onClose }: TourGuideProps) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [tipPos, setTipPos] = useState<{ top: number; left: number; arrow: 'top' | 'bottom' | 'left' | 'right' | 'none' } | null>(null)
  const [viewport, setViewport] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  const step = steps[index]
  const total = steps.length

  useEffect(() => {
    if (isOpen) setIndex(0)
  }, [isOpen])

  const measure = useCallback(() => {
    if (!step) return
    const w = typeof window !== 'undefined' ? window.innerWidth : 0
    const h = typeof window !== 'undefined' ? window.innerHeight : 0
    setViewport({ w, h })

    if (!step.target) {
      setRect(null)
      setTipPos({
        top: h / 2 - TIP_H_EST / 2,
        left: w / 2 - TIP_W / 2,
        arrow: 'none',
      })
      return
    }

    const el = document.querySelector(step.target) as HTMLElement | null
    if (!el) {
      // Target missing — fall back to centered modal
      setRect(null)
      setTipPos({
        top: h / 2 - TIP_H_EST / 2,
        left: w / 2 - TIP_W / 2,
        arrow: 'none',
      })
      return
    }

    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    } catch {
      // ignore
    }

    const r = el.getBoundingClientRect()
    const target: Rect = {
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    }
    setRect(target)

    const placement = step.placement || 'auto'
    const spaceBelow = h - (target.top + target.height)
    const spaceAbove = target.top
    const spaceRight = w - (target.left + target.width)
    const spaceLeft = target.left

    let chosen: 'top' | 'bottom' | 'left' | 'right' = 'bottom'
    if (placement !== 'auto') {
      chosen = placement
    } else if (spaceBelow > TIP_H_EST + PAD + VP_MARGIN) {
      chosen = 'bottom'
    } else if (spaceAbove > TIP_H_EST + PAD + VP_MARGIN) {
      chosen = 'top'
    } else if (spaceRight > TIP_W + PAD + VP_MARGIN) {
      chosen = 'right'
    } else if (spaceLeft > TIP_W + PAD + VP_MARGIN) {
      chosen = 'left'
    } else {
      chosen = spaceBelow >= spaceAbove ? 'bottom' : 'top'
    }

    let top = 0
    let left = 0
    if (chosen === 'bottom') {
      top = target.top + target.height + PAD
      left = target.left + target.width / 2 - TIP_W / 2
    } else if (chosen === 'top') {
      top = target.top - TIP_H_EST - PAD
      left = target.left + target.width / 2 - TIP_W / 2
    } else if (chosen === 'right') {
      top = target.top + target.height / 2 - TIP_H_EST / 2
      left = target.left + target.width + PAD
    } else {
      top = target.top + target.height / 2 - TIP_H_EST / 2
      left = target.left - TIP_W - PAD
    }

    // Clamp inside viewport
    left = Math.max(VP_MARGIN, Math.min(left, w - TIP_W - VP_MARGIN))
    top = Math.max(VP_MARGIN, Math.min(top, h - TIP_H_EST - VP_MARGIN))

    setTipPos({ top, left, arrow: chosen })
  }, [step])

  useLayoutEffect(() => {
    if (!isOpen) return
    measure()
  }, [isOpen, measure])

  useEffect(() => {
    if (!isOpen) return
    const onResize = () => measure()
    const onScroll = () => measure()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)
    const id = window.setInterval(measure, 400) // pick up layout shifts (focus mode, panels)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
      window.clearInterval(id)
    }
  }, [isOpen, measure])

  const next = useCallback(() => {
    if (index < total - 1) setIndex(i => i + 1)
    else onClose(true)
  }, [index, total, onClose])

  const prev = useCallback(() => {
    if (index > 0) setIndex(i => i - 1)
  }, [index])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false)
      else if (e.key === 'ArrowRight' || e.key === 'Enter') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, next, prev, onClose])

  const cutout = useMemo(() => {
    if (!rect) return null
    const r = 14
    return {
      top: rect.top - 6,
      left: rect.left - 6,
      width: rect.width + 12,
      height: rect.height + 12,
      radius: r,
    }
  }, [rect])

  if (!isOpen || !step) return null

  return (
    <AnimatePresence>
      <motion.div
        key="tour-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998]"
        aria-modal="true"
        role="dialog"
        aria-label="Product tour"
      >
        {/* Dim overlay with cutout via SVG mask */}
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0 pointer-events-auto"
          onClick={() => onClose(false)}
          aria-hidden="true"
        >
          <defs>
            <mask id="tour-cutout-mask">
              <rect width="100%" height="100%" fill="white" />
              {cutout && (
                <rect
                  x={cutout.left}
                  y={cutout.top}
                  width={cutout.width}
                  height={cutout.height}
                  rx={cutout.radius}
                  ry={cutout.radius}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.65)"
            mask="url(#tour-cutout-mask)"
          />
        </svg>

        {/* Highlight ring around target */}
        {cutout && (
          <motion.div
            key={`ring-${index}`}
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              top: cutout.top,
              left: cutout.left,
              width: cutout.width,
              height: cutout.height,
              borderRadius: cutout.radius,
            }}
            className="pointer-events-none absolute ring-2 ring-cyan-400 shadow-[0_0_0_4px_rgba(34,211,238,0.18),0_0_40px_rgba(34,211,238,0.45)]"
          />
        )}

        {/* Tooltip */}
        {tipPos && (
          <motion.div
            key={`tip-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              top: tipPos.top,
              left: tipPos.left,
              width: TIP_W,
              maxWidth: `calc(100vw - ${VP_MARGIN * 2}px)`,
            }}
            className="pointer-events-auto absolute rounded-2xl border border-white/10 bg-[#0b1220]/95 p-5 text-white shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-300">
                  <Info size={14} />
                </span>
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.28em] text-cyan-300/80">
                  Tour · {index + 1}/{total}
                </span>
              </div>
              <button
                onClick={() => onClose(false)}
                aria-label="Close tour"
                className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <h3 className="mt-3 text-base font-black tracking-tight">{step.title}</h3>
            <p className="mt-2 text-[12px] leading-relaxed text-white/75">{step.body}</p>

            {/* Progress dots */}
            <div className="mt-4 flex items-center gap-1.5">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === index ? 'w-6 bg-cyan-400' : i < index ? 'w-3 bg-cyan-400/40' : 'w-3 bg-white/15'
                  }`}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => onClose(false)}
                className="rounded-lg px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white"
              >
                Skip
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  disabled={index === 0}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80 transition disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  onClick={next}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-400"
                >
                  {index === total - 1 ? 'Done' : 'Next'}
                  {index !== total - 1 && <ChevronRight size={12} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Viewport-only marker for layout debug; keep empty in prod */}
        <span className="sr-only" aria-hidden="true">{`viewport ${viewport.w}x${viewport.h}`}</span>
      </motion.div>
    </AnimatePresence>
  )
}

export const DEFAULT_TOUR_STORAGE_KEY = 'algovision.tour.completed.v1'
