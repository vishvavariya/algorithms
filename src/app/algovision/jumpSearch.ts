import { AlgorithmStep, Language } from '../types'

export const jumpSearchCode: Record<Language, string> = {
  typescript: `function jumpSearch(arr: number[], target: number) {
  const n = arr.length;
  const step = Math.floor(Math.sqrt(n));
  let prev = 0;
  let next = step;

  while (arr[Math.min(next, n) - 1] < target) {
    prev = next;
    next += step;
    if (prev >= n) return -1;
  }

  for (let i = prev; i < Math.min(next, n); i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
  python: `def jump_search(arr, target):
    n = len(arr)
    step = int(n ** 0.5)
    prev, next_block = 0, step

    while arr[min(next_block, n) - 1] < target:
        prev = next_block
        next_block += step
        if prev >= n:
            return -1

    for i in range(prev, min(next_block, n)):
        if arr[i] == target:
            return i
    return -1`,
  javascript: `function jumpSearch(arr, target) {
  const n = arr.length;
  const step = Math.floor(Math.sqrt(n));
  let prev = 0;
  let next = step;

  while (arr[Math.min(next, n) - 1] < target) {
    prev = next;
    next += step;
    if (prev >= n) return -1;
  }

  for (let i = prev; i < Math.min(next, n); i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
  cpp: `int jumpSearch(vector<int>& arr, int target) {
    int n = arr.size();
    int step = sqrt(n);
    int prev = 0, next = step;

    while (arr[min(next, n) - 1] < target) {
        prev = next;
        next += step;
        if (prev >= n) return -1;
    }

    for (int i = prev; i < min(next, n); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`
}

export function* jumpSearchGenerator(arr: number[], target: number): Generator<AlgorithmStep> {
  const data = [...arr].sort((a, b) => a - b)
  const n = data.length
  const blockSize = Math.max(1, Math.floor(Math.sqrt(n)))
  let prev = 0
  let next = blockSize

  yield {
    codeLine: 3,
    description: `Jump size is ${blockSize}. The array is sorted before the search begins.`,
    state: { array: [...data], comparingIndices: Array.from({ length: Math.min(blockSize, n) }, (_, index) => index) },
  }

  while (prev < n && data[Math.min(next, n) - 1] < target) {
    yield {
      codeLine: 7,
      description: `Target is bigger than block ending at index ${Math.min(next, n) - 1}. Jumping forward.`,
      state: {
        array: [...data],
        comparingIndices: [Math.min(next, n) - 1],
        swappingIndices: Array.from({ length: Math.min(next, n) - prev }, (_, index) => prev + index),
      },
    }
    prev = next
    next += blockSize
  }

  const end = Math.min(next, n)
  yield {
    codeLine: 13,
    description: `Target could live between index ${prev} and ${end - 1}. Scanning that block.`,
    state: { array: [...data], comparingIndices: Array.from({ length: end - prev }, (_, index) => prev + index) },
  }

  for (let i = prev; i < end; i++) {
    yield {
      codeLine: 14,
      description: `Checking index ${i}: is ${data[i]} equal to ${target}?`,
      state: { array: [...data], comparingIndices: [i], pivotIndex: i },
    }
    if (data[i] === target) {
      yield {
        codeLine: 14,
        description: `Found ${target} at index ${i}!`,
        state: { array: [...data], foundIndex: i, sortedIndices: [i] },
      }
      return
    }
  }

  yield {
    codeLine: 17,
    description: `${target} not found after the jump block scan.`,
    state: { array: [...data], foundIndex: -1 },
  }
}
