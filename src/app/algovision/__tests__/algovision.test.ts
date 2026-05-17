/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { ALGORITHM_REGISTRY } from '../../data/registry'

describe('Algorithm Generators', () => {
  // Test Sorting Algorithms
  const sortingAlgos = [
    'bubble-sort',
    'insertion-sort',
    'selection-sort',
    'quick-sort',
    'heap-sort',
    'counting-sort',
    'merge-sort',
    'social-sort'
  ]

  sortingAlgos.forEach(id => {
    const algo = ALGORITHM_REGISTRY[id]
    if (!algo) return

    describe(`${algo.label} (Intensive)`, () => {
      it('should handle an empty array', () => {
        const generator = algo.generator([])
        let lastStep: any
        for (const step of generator) lastStep = step
        expect(lastStep.state.array).toEqual([])
      })

      it('should handle a single-element array', () => {
        const generator = algo.generator([42])
        let lastStep: any
        for (const step of generator) lastStep = step
        expect(lastStep.state.array).toEqual([42])
      })

      it('should sort a large array of 100 random elements', () => {
        const input = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
        const generator = algo.generator([...input])
        let lastStep: any
        for (const step of generator) lastStep = step
        const result = lastStep.state.array
        expect(result).toEqual([...input].sort((a, b) => a - b))
      })

      it('should handle reverse-sorted arrays', () => {
        const input = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
        const generator = algo.generator([...input])
        let lastStep: any
        for (const step of generator) lastStep = step
        expect(lastStep.state.array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      })

      it('should handle arrays with duplicate elements', () => {
        const input = [5, 2, 5, 1, 2, 8, 8, 1]
        const generator = algo.generator([...input])
        let lastStep: any
        for (const step of generator) lastStep = step
        expect(lastStep.state.array).toEqual([1, 1, 2, 2, 5, 5, 8, 8])
      })
    })
  })

  // Test Searching Algorithms
  const searchingAlgos = [
    'linear-search',
    'binary-search',
    'jump-search'
  ]

  searchingAlgos.forEach(id => {
    const algo = ALGORITHM_REGISTRY[id]
    if (!algo) return

    describe(`${algo.label} (Intensive)`, () => {
      it('should return -1 for an empty array', () => {
        const generator = algo.generator([], 5)
        let lastStep: any
        for (const step of generator) lastStep = step
        expect(lastStep.state.foundIndex).toBe(-1)
      })

      it('should find elements at the very beginning and end', () => {
        const input = [1, 2, 3, 4, 5]
        
        // Test beginning
        let gen = algo.generator(input, 1)
        let step: any
        for (const s of gen) step = s
        expect(step.state.foundIndex).toBe(0)

        // Test end
        gen = algo.generator(input, 5)
        for (const s of gen) step = s
        expect(step.state.foundIndex).toBe(4)
      })

      it('should find elements in a large sorted array', () => {
        const input = Array.from({ length: 1000 }, (_, i) => i * 2)
        const target = 500
        const generator = algo.generator(input, target)
        let lastStep: any
        for (const step of generator) lastStep = step
        expect(lastStep.state.foundIndex).toBe(250)
      })
    })
  })

  // Test Graph/Pathfinding Algorithms (Verification of execution)
  const graphAlgos = [
    'dijkstra',
    'bellman-ford',
    'bfs',
    'dfs',
    'a-star'
  ]

  graphAlgos.forEach(id => {
    const algo = ALGORITHM_REGISTRY[id]
    if (!algo) return

    it(`${algo.label} should run and complete`, () => {
      const generator = algo.generator(null)
      let lastStep: any
      
      for (const step of generator) {
        lastStep = step
      }

      expect(lastStep).toBeDefined()
      expect(lastStep.state.nodes).toBeDefined()
      expect(lastStep.description).toMatch(/complete|found/i)
    })
  })

  // Test ML/Strategy Algorithms
  const otherAlgos = [
    'k-means',
    'linear-regression',
    'n-queens',
    'fibonacci'
  ]

  otherAlgos.forEach(id => {
    const algo = ALGORITHM_REGISTRY[id]
    if (!algo) return

    it(`${algo.label} should run and complete`, () => {
      const generator = algo.generator(null)
      let lastStep: any
      
      for (const step of generator) {
        lastStep = step
      }

      expect(lastStep).toBeDefined()
      expect(lastStep.description).toMatch(/complete|converged|placed|calculated/i)
    })
  })
})
