'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AlgorithmStep } from '../types'

export function useAlgorithmRunner(
  generator: Generator<AlgorithmStep> | null,
  speed: number,
  onStepDone?: (step: AlgorithmStep) => void
) {
  const [history, setHistory] = useState<AlgorithmStep[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Pre-compute all steps when generator changes
  useEffect(() => {
    if (!generator) {
      setHistory([])
      setCurrentIndex(0)
      setIsPlaying(false)
      return
    }

    const steps: AlgorithmStep[] = []
    let result = generator.next()
    while (!result.done) {
      steps.push(result.value)
      result = generator.next()
    }
    setHistory(steps)
    setCurrentIndex(0)
    setIsPlaying(false)
  }, [generator])

  const stepForward = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = Math.min(prev + 1, history.length - 1)
      if (next === prev) setIsPlaying(false)
      return next
    })
  }, [history.length])

  const stepBackward = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const scrubTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, history.length - 1)))
  }, [history.length])

  const togglePlay = useCallback(() => {
    if (currentIndex >= history.length - 1) {
      setCurrentIndex(0)
      setIsPlaying(true)
    } else {
      setIsPlaying((prev) => !prev)
    }
  }, [currentIndex, history.length])

  // Playback Loop
  useEffect(() => {
    if (isPlaying && currentIndex < history.length - 1) {
      const delay = Math.max(10, 1000 - speed * 9.5) // 1ms to 1s delay
      timerRef.current = setTimeout(() => {
        const nextIndex = currentIndex + 1
        setCurrentIndex(nextIndex)
        if (onStepDone && history[nextIndex]) {
          onStepDone(history[nextIndex])
        }
      }, delay)
    } else if (currentIndex >= history.length - 1) {
      setIsPlaying(false)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentIndex, history, speed, onStepDone])

  return {
    currentStep: history[currentIndex] || null,
    currentIndex,
    totalSteps: history.length,
    isPlaying,
    isFinished: currentIndex >= history.length - 1 && history.length > 0,
    togglePlay,
    stepForward,
    stepBackward,
    scrubTo,
    reset: () => {
      setCurrentIndex(0)
      setIsPlaying(false)
    }
  }
}
