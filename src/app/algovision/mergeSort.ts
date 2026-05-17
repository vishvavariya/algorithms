import { AlgorithmStep, Language } from '../types'

export const mergeSortCode: Record<Language, string> = {
  typescript: `function mergeSort(arr: number[]) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  let result = [], i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
  python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
  javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  let result = [], i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
  cpp: `void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}

void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}`
}

export function* mergeSortGenerator(arr: number[]): Generator<AlgorithmStep> {
  const data = [...arr]
  const n = data.length

  function* sort(start: number, end: number): Generator<AlgorithmStep> {
    if (end - start <= 0) return

    const mid = Math.floor((start + end) / 2)
    
    yield {
      codeLine: 4,
      description: `Splitting array at index ${mid}. Left: [${start}...${mid}], Right: [${mid + 1}...${end}]`,
      state: { array: [...data], comparingIndices: Array.from({length: end - start + 1}, (_, i) => i + start) }
    }

    yield* sort(start, mid)
    yield* sort(mid + 1, end)
    yield* merge(start, mid, end)
  }

  function* merge(start: number, mid: number, end: number): Generator<AlgorithmStep> {
    const left = data.slice(start, mid + 1)
    const right = data.slice(mid + 1, end + 1)
    
    let i = 0, j = 0, k = start

    yield {
      codeLine: 13,
      description: `Merging two sorted subarrays: [${left.join(',')}] and [${right.join(',')}]`,
      state: { array: [...data], comparingIndices: Array.from({length: end - start + 1}, (_, i) => i + start) }
    }

    while (i < left.length && j < right.length) {
      yield {
        codeLine: 15,
        description: `Comparing ${left[i]} and ${right[j]}`,
        state: { array: [...data], comparingIndices: [start + i, mid + 1 + j] }
      }

      if (left[i] <= right[j]) {
        data[k] = left[i]
        i++
      } else {
        data[k] = right[j]
        j++
      }
      k++
      yield {
        codeLine: 16,
        description: `Placed ${data[k-1]} in merged array.`,
        state: { array: [...data], swappingIndices: [k-1] }
      }
    }

    while (i < left.length) {
      data[k++] = left[i++]
      yield {
        codeLine: 19,
        description: `Copying remaining element ${data[k-1]} from left subarray.`,
        state: { array: [...data], swappingIndices: [k-1] }
      }
    }

    while (j < right.length) {
      data[k++] = right[j++]
      yield {
        codeLine: 19,
        description: `Copying remaining element ${data[k-1]} from right subarray.`,
        state: { array: [...data], swappingIndices: [k-1] }
      }
    }
  }

  yield* sort(0, n - 1)

  yield {
    codeLine: 10,
    description: 'Merge Sort complete!',
    state: { array: [...data], sortedIndices: Array.from({length: n}, (_, i) => i) }
  }
}
