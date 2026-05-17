import { AlgorithmStep, Language } from '../types'

export const bubbleSortCode: Record<Language, string> = {
  typescript: `function bubbleSort(arr: number[]) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
  python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
  javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
  cpp: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                swap(arr[j], arr[j+1]);
            }
        }
    }
}`
}

export function* bubbleSortGenerator(arr: number[]): Generator<AlgorithmStep> {
  const n = arr.length
  const data = [...arr]
  const sortedIndices: number[] = []

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Comparison step
      yield {
        codeLine: 4, // for typescript
        description: `Comparing ${data[j]} and ${data[j+1]}`,
        state: {
          array: [...data],
          comparingIndices: [j, j + 1],
          sortedIndices: [...sortedIndices]
        }
      }

      if (data[j] > data[j + 1]) {
        // Swap step
        const temp = data[j]
        data[j] = data[j + 1]
        data[j + 1] = temp
        
        yield {
          codeLine: 5,
          description: `Swapping ${data[j+1]} and ${data[j]}`,
          state: {
            array: [...data],
            swappingIndices: [j, j + 1],
            sortedIndices: [...sortedIndices]
          }
        }
      }
    }
    sortedIndices.push(n - i - 1)
  }
  
  yield {
    codeLine: 10,
    description: 'Sorting complete!',
    state: {
      array: [...data],
      sortedIndices: Array.from({length: n}, (_, i) => i)
    }
  }
}
