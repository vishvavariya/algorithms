import { useState, useCallback, useMemo } from 'react'
import { AlgorithmStep } from '../types'

/**
 * Pure State Container for Algorithm Snapshots.
 * Supports pre-calculating snapshots from a generator for predictable playback.
 */
export function useAlgorithmStore() {
  const [history, setHistory] = useState<AlgorithmStep[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  /**
   * Initializes the store by exhausting a generator and caching all steps.
   */
  const init = useCallback((generator: Generator<AlgorithmStep>) => {
    const snapshots: AlgorithmStep[] = []
    
    // Exhaust the generator to get all snapshots
    let result = generator.next()
    while (!result.done) {
      snapshots.push(result.value)
      result = generator.next()
    }

    setHistory(snapshots)
    setCurrentIndex(0)
  }, [])

  /**
   * Advances the current index by one. Returns the result status.
   */
  const step = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1)
      return { done: false }
    }
    return { done: true }
  }, [currentIndex, history.length])

  /**
   * Seeks to a specific step in the history.
   */
  const goTo = useCallback((idx: number) => {
    setCurrentIndex(Math.max(0, Math.min(idx, history.length - 1)))
  }, [history.length])

  /**
   * Resets the playback to the start.
   */
  const reset = useCallback(() => {
    setCurrentIndex(0)
  }, [])

  return useMemo(() => ({
    history,
    currentIndex,
    currentStep: history[currentIndex] || null,
    totalSteps: history.length,
    isFinished: currentIndex >= history.length - 1 && history.length > 0,
    init,
    step,
    goTo,
    reset,
    setCurrentIndex
  }), [history, currentIndex, init, step, goTo, reset])
}
