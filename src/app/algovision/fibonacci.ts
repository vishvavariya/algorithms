import { AlgorithmStep, Language } from '../types'

export const fibonacciCode: Record<Language, string> = {
  typescript: `function fib(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}`,
  python: `def fib(n, memo={}):
    if n <= 1:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]`,
  javascript: `function fib(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n] !== undefined) return memo[n];
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}`,
  cpp: `int fib(int n, vector<int>& memo) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    return memo[n];
}`
}

export function* fibonacciGenerator(n: number = 8): Generator<AlgorithmStep> {
  const memo: (number | null)[] = Array(n + 1).fill(null)
  
  function* solve(curr: number): Generator<AlgorithmStep, number, unknown> {
    yield {
      codeLine: 2,
      description: `Calculating fib(${curr})...`,
      state: { grid: [memo] }
    }

    if (curr <= 1) {
      memo[curr] = curr
      yield {
        codeLine: 2,
        description: `Base case reached: fib(${curr}) = ${curr}`,
        state: { grid: [memo] }
      }
      return curr
    }

    if (memo[curr] !== null) {
      yield {
        codeLine: 3,
        description: `Using memoized value for fib(${curr}): ${memo[curr]}`,
        state: { grid: [memo] }
      }
      return memo[curr] as number
    }

    const val1: number = yield* solve(curr - 1)
    const val2: number = yield* solve(curr - 2)
    memo[curr] = val1 + val2

    yield {
      codeLine: 4,
      description: `Computed fib(${curr}) = fib(${curr-1}) + fib(${curr-2}) = ${memo[curr]}`,
      state: { grid: [memo] }
    }
    return memo[curr] as number
  }

  yield* solve(n)

  yield {
    codeLine: 5,
    description: `Fibonacci sequence up to ${n} complete! Result: ${memo[n]}`,
    state: { grid: [memo] }
  }
}
