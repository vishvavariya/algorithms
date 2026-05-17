import { AlgorithmStep, Language } from '../types'

export const heapSortCode: Record<Language, string> = {
  typescript: `function heapSort(arr: number[]) {
  const heapify = (n: number, i: number) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      heapify(n, largest);
    }
  };

  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) heapify(arr.length, i);
  for (let end = arr.length - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    heapify(end, 0);
  }
  return arr;
}`,
  python: `def heap_sort(arr):
    def heapify(n, i):
        largest = i
        left, right = 2 * i + 1, 2 * i + 2
        if left < n and arr[left] > arr[largest]:
            largest = left
        if right < n and arr[right] > arr[largest]:
            largest = right
        if largest != i:
            arr[i], arr[largest] = arr[largest], arr[i]
            heapify(n, largest)

    for i in range(len(arr) // 2 - 1, -1, -1):
        heapify(len(arr), i)
    for end in range(len(arr) - 1, 0, -1):
        arr[0], arr[end] = arr[end], arr[0]
        heapify(end, 0)
    return arr`,
  javascript: `function heapSort(arr) {
  function heapify(n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      heapify(n, largest);
    }
  }
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) heapify(arr.length, i);
  for (let end = arr.length - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    heapify(end, 0);
  }
  return arr;
}`,
  cpp: `void heapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1, right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void heapSort(vector<int>& arr) {
    for (int i = arr.size() / 2 - 1; i >= 0; i--) heapify(arr, arr.size(), i);
    for (int end = arr.size() - 1; end > 0; end--) {
        swap(arr[0], arr[end]);
        heapify(arr, end, 0);
    }
}`
}

export function* heapSortGenerator(arr: number[]): Generator<AlgorithmStep> {
  const data = [...arr]
  const sortedIndices: number[] = []

  function* heapify(heapSize: number, root: number): Generator<AlgorithmStep> {
    let largest = root
    const left = 2 * root + 1
    const right = 2 * root + 2

    yield {
      codeLine: 3,
      description: `Heapifying node ${root}. Children are ${left < heapSize ? data[left] : 'empty'} and ${right < heapSize ? data[right] : 'empty'}.`,
      state: { array: [...data], pivotIndex: root, comparingIndices: [root, left, right].filter(index => index < heapSize), sortedIndices: [...sortedIndices] },
    }

    if (left < heapSize && data[left] > data[largest]) largest = left
    if (right < heapSize && data[right] > data[largest]) largest = right

    if (largest !== root) {
      ;[data[root], data[largest]] = [data[largest], data[root]]
      yield {
        codeLine: 9,
        description: `Swapping ${data[largest]} with larger child ${data[root]} to restore heap order.`,
        state: { array: [...data], swappingIndices: [root, largest], sortedIndices: [...sortedIndices] },
      }
      yield* heapify(heapSize, largest)
    }
  }

  for (let i = Math.floor(data.length / 2) - 1; i >= 0; i--) {
    yield {
      codeLine: 14,
      description: `Building max heap from parent index ${i}.`,
      state: { array: [...data], pivotIndex: i, sortedIndices: [...sortedIndices] },
    }
    yield* heapify(data.length, i)
  }

  for (let end = data.length - 1; end > 0; end--) {
    ;[data[0], data[end]] = [data[end], data[0]]
    sortedIndices.push(end)
    yield {
      codeLine: 16,
      description: `Extracted heap maximum ${data[end]} into final index ${end}.`,
      state: { array: [...data], swappingIndices: [0, end], sortedIndices: [...sortedIndices] },
    }
    yield* heapify(end, 0)
  }

  yield {
    codeLine: 20,
    description: 'Heap Sort complete! The heap has been fully drained.',
    state: { array: [...data], sortedIndices: Array.from({ length: data.length }, (_, index) => index) },
  }
}
