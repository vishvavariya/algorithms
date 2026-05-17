import { AlgorithmStep, Language } from '../types'

export const linearSearchCode: Record<Language, string> = {
  typescript: `function linearSearch(arr: number[], target: number) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`,
  python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
  javascript: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`,
  cpp: `int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`
}

export function* linearSearchGenerator(arr: number[], target: number): Generator<AlgorithmStep> {
  const data = [...arr]

  for (let i = 0; i < data.length; i++) {
    yield {
      codeLine: 2,
      description: `Checking index ${i}: is ${data[i]} equal to ${target}?`,
      state: {
        array: [...data],
        comparingIndices: [i]
      }
    }

    if (data[i] === target) {
      yield {
        codeLine: 4,
        description: `Found ${target} at index ${i}!`,
        state: {
          array: [...data],
          foundIndex: i,
          sortedIndices: [i] // using green for found
        }
      }
      return
    }
  }

  yield {
    codeLine: 7,
    description: `${target} not found in the array.`,
    state: {
      array: [...data],
      foundIndex: -1
    }
  }
}
