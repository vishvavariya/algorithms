import { AlgorithmStep, Language } from '../types'

export const selectionSortCode: Record<Language, string> = {
  typescript: `function selectionSort(arr: number[]) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
  python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
  javascript: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    let temp = arr[i];
    arr[i] = arr[minIdx];
    arr[minIdx] = temp;
  }
  return arr;
}`,
  cpp: `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        swap(arr[i], arr[minIdx]);
    }
}`
}

export function* selectionSortGenerator(arr: number[]): Generator<AlgorithmStep> {
  const data = [...arr]
  const n = data.length
  const sortedIndices: number[] = []

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    
    yield {
      codeLine: 4,
      description: `Assuming index ${i} has the minimum value (${data[i]}).`,
      state: { array: [...data], pivotIndex: minIdx, sortedIndices: [...sortedIndices] }
    }

    for (let j = i + 1; j < n; j++) {
      yield {
        codeLine: 6,
        description: `Comparing index ${j} (${data[j]}) with current minimum index ${minIdx} (${data[minIdx]}).`,
        state: { 
          array: [...data], 
          comparingIndices: [j, minIdx], 
          pivotIndex: minIdx, 
          sortedIndices: [...sortedIndices] 
        }
      }

      if (data[j] < data[minIdx]) {
        minIdx = j
        yield {
          codeLine: 6,
          description: `New minimum found: index ${minIdx} (${data[minIdx]}).`,
          state: { array: [...data], pivotIndex: minIdx, sortedIndices: [...sortedIndices] }
        }
      }
    }

    if (minIdx !== i) {
      const temp = data[i]
      data[i] = data[minIdx]
      data[minIdx] = temp
      
      yield {
        codeLine: 8,
        description: `Swapping ${data[i]} and ${data[minIdx]} to place minimum at index ${i}.`,
        state: { array: [...data], swappingIndices: [i, minIdx], sortedIndices: [...sortedIndices] }
      }
    }
    
    sortedIndices.push(i)
  }

  yield {
    codeLine: 11,
    description: 'Selection Sort complete!',
    state: { array: [...data], sortedIndices: Array.from({length: n}, (_, idx) => idx) }
  }
}
