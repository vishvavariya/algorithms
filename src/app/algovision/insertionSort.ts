import { AlgorithmStep, Language } from '../types'

export const insertionSortCode: Record<Language, string> = {
  typescript: `function insertionSort(arr: number[]) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
  python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
  javascript: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
  cpp: `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`
}

export function* insertionSortGenerator(arr: number[]): Generator<AlgorithmStep> {
  const data = [...arr]
  const n = data.length

  for (let i = 1; i < n; i++) {
    let key = data[i]
    let j = i - 1

    yield {
      codeLine: 3,
      description: `Picking ${key} as key to insert.`,
      state: { 
        array: [...data], 
        pivotIndex: i, 
        sortedIndices: Array.from({length: i}, (_, idx) => idx) 
      }
    }

    while (j >= 0 && data[j] > key) {
      yield {
        codeLine: 5,
        description: `Is ${data[j]} > ${key}? Yes, shifting ${data[j]} forward.`,
        state: { 
          array: [...data], 
          comparingIndices: [j], 
          pivotIndex: i,
          sortedIndices: Array.from({length: i}, (_, idx) => idx) 
        }
      }
      
      data[j + 1] = data[j]
      j = j - 1
      
      yield {
        codeLine: 6,
        description: `Shifted element.`,
        state: { 
          array: [...data], 
          swappingIndices: [j + 1, j + 2], 
          pivotIndex: i,
          sortedIndices: Array.from({length: i}, (_, idx) => idx) 
        }
      }
    }
    
    data[j + 1] = key
    
    yield {
      codeLine: 9,
      description: `Inserted ${key} at index ${j + 1}.`,
      state: { 
        array: [...data], 
        swappingIndices: [j + 1], 
        sortedIndices: Array.from({length: i + 1}, (_, idx) => idx) 
      }
    }
  }

  yield {
    codeLine: 12,
    description: 'Insertion Sort complete!',
    state: { 
      array: [...data], 
      sortedIndices: Array.from({length: n}, (_, idx) => idx) 
    }
  }
}
