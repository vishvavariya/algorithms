import { AlgorithmStep, Language } from '../types'

export const quickSortCode: Record<Language, string> = {
  typescript: `function quickSort(arr: number[], left = 0, right = arr.length - 1) {
  if (left < right) {
    const pivotIndex = partition(arr, left, right);
    quickSort(arr, left, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, right);
  }
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left - 1;
  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
  return i + 1;
}`,
  python: `def quick_sort(arr, left=0, right=None):
    if right is None:
        right = len(arr) - 1
    if left < right:
        pivot_index = partition(arr, left, right)
        quick_sort(arr, left, pivot_index - 1)
        quick_sort(arr, pivot_index + 1, right)

def partition(arr, left, right):
    pivot = arr[right]
    i = left - 1
    for j in range(left, right):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[right] = arr[right], arr[i + 1]
    return i + 1`,
  javascript: `function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left < right) {
    const pivotIndex = partition(arr, left, right);
    quickSort(arr, left, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, right);
  }
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left - 1;
  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      i++;
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  let temp = arr[i + 1];
  arr[i + 1] = arr[right];
  arr[right] = temp;
  return i + 1;
}`,
  cpp: `void quickSort(int arr[], int left, int right) {
    if (left < right) {
        int pivotIndex = partition(arr, left, right);
        quickSort(arr, left, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, right);
    }
}

int partition(int arr[], int left, int right) {
    int pivot = arr[right];
    int i = left - 1;
    for (int j = left; j < right; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[right]);
    return i + 1;
}`
}

export function* quickSortGenerator(arr: number[]): Generator<AlgorithmStep> {
  const data = [...arr]
  const sortedIndices: number[] = []

  function* sort(l: number, r: number): Generator<AlgorithmStep> {
    if (l < r) {
      const pIdx = yield* partition(l, r)
      yield* sort(l, pIdx - 1)
      yield* sort(pIdx + 1, r)
    } else if (l === r) {
      sortedIndices.push(l)
    }
  }

  function* partition(l: number, r: number): Generator<AlgorithmStep> {
    const pivot = data[r]
    yield {
      codeLine: 13,
      description: `Picking pivot: ${pivot} at index ${r}`,
      state: { array: [...data], pivotIndex: r, sortedIndices: [...sortedIndices] }
    }

    let i = l - 1
    for (let j = l; j < r; j++) {
      yield {
        codeLine: 16,
        description: `Comparing ${data[j]} with pivot ${pivot}`,
        state: { 
          array: [...data], 
          comparingIndices: [j, r], 
          pivotIndex: r, 
          sortedIndices: [...sortedIndices] 
        }
      }

      if (data[j] < pivot) {
        i++
        const temp = data[i]
        data[i] = data[j]
        data[j] = temp
        yield {
          codeLine: 19,
          description: `Swapping ${data[i]} and ${data[j]}`,
          state: { 
            array: [...data], 
            swappingIndices: [i, j], 
            pivotIndex: r, 
            sortedIndices: [...sortedIndices] 
          }
        }
      }
    }

    const temp = data[i + 1]
    data[i + 1] = data[r]
    data[r] = temp
    sortedIndices.push(i + 1)

    yield {
      codeLine: 22,
      description: `Placing pivot ${pivot} at its correct position: index ${i + 1}`,
      state: { 
        array: [...data], 
        swappingIndices: [i + 1, r], 
        sortedIndices: [...sortedIndices] 
      }
    }

    return i + 1
  }

  yield* sort(0, data.length - 1)

  yield {
    codeLine: 10,
    description: 'Quick Sort complete!',
    state: {
      array: [...data],
      sortedIndices: Array.from({length: data.length}, (_, i) => i)
    }
  }
}
