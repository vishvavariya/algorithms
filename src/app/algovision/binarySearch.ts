import { AlgorithmStep, Language } from '../types'

export const binarySearchCode: Record<Language, string> = {
  typescript: `function binarySearch(arr: number[], target: number) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
  python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
  javascript: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
  cpp: `int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`
}

export function* binarySearchGenerator(arr: number[], target: number): Generator<AlgorithmStep> {
  const data = [...arr].sort((a, b) => a - b)
  let left = 0
  let right = data.length - 1

  yield {
    codeLine: 2,
    description: 'Initial pointers set at start and end of sorted array.',
    state: { array: [...data], comparingIndices: [left, right] }
  }

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    
    yield {
      codeLine: 6,
      description: `Checking middle element at index ${mid}: ${data[mid]}`,
      state: { 
        array: [...data], 
        pivotIndex: mid, 
        comparingIndices: Array.from({length: right - left + 1}, (_, i) => i + left)
      }
    }

    if (data[mid] === target) {
      yield {
        codeLine: 7,
        description: `Found ${target} at index ${mid}!`,
        state: { array: [...data], foundIndex: mid, sortedIndices: [mid] }
      }
      return
    }

    if (data[mid] < target) {
      yield {
        codeLine: 8,
        description: `${data[mid]} is less than ${target}. Searching in the right half.`,
        state: { 
          array: [...data], 
          comparingIndices: [mid],
          swappingIndices: Array.from({length: mid - left + 1}, (_, i) => i + left) // mark as discarded
        }
      }
      left = mid + 1
    } else {
      yield {
        codeLine: 9,
        description: `${data[mid]} is greater than ${target}. Searching in the left half.`,
        state: { 
          array: [...data], 
          comparingIndices: [mid],
          swappingIndices: Array.from({length: right - mid + 1}, (_, i) => i + mid) // mark as discarded
        }
      }
      right = mid - 1
    }
  }

  yield {
    codeLine: 11,
    description: `${target} not found in the array.`,
    state: { array: [...data], foundIndex: -1 }
  }
}
