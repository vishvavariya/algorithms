import { AlgorithmStep, Language } from '../types'

export const countingSortCode: Record<Language, string> = {
  typescript: `function countingSort(arr: number[]) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const counts = Array(max - min + 1).fill(0);

  for (const value of arr) counts[value - min]++;

  let index = 0;
  for (let i = 0; i < counts.length; i++) {
    while (counts[i] > 0) {
      arr[index++] = i + min;
      counts[i]--;
    }
  }
  return arr;
}`,
  python: `def counting_sort(arr):
    low, high = min(arr), max(arr)
    counts = [0] * (high - low + 1)
    for value in arr:
        counts[value - low] += 1

    index = 0
    for i, count in enumerate(counts):
        while count > 0:
            arr[index] = i + low
            index += 1
            count -= 1
    return arr`,
  javascript: `function countingSort(arr) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const counts = Array(max - min + 1).fill(0);
  for (const value of arr) counts[value - min]++;

  let index = 0;
  for (let i = 0; i < counts.length; i++) {
    while (counts[i] > 0) {
      arr[index++] = i + min;
      counts[i]--;
    }
  }
  return arr;
}`,
  cpp: `void countingSort(vector<int>& arr) {
    int low = *min_element(arr.begin(), arr.end());
    int high = *max_element(arr.begin(), arr.end());
    vector<int> counts(high - low + 1, 0);
    for (int value : arr) counts[value - low]++;

    int index = 0;
    for (int i = 0; i < counts.size(); i++) {
        while (counts[i]-- > 0) {
            arr[index++] = i + low;
        }
    }
}`
}

export function* countingSortGenerator(arr: number[]): Generator<AlgorithmStep> {
  const original = [...arr]
  const data = [...arr]
  if (data.length === 0) {
    yield {
      codeLine: 18,
      description: 'Empty array, nothing to sort.',
      state: { array: [] }
    }
    return
  }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const counts = Array(max - min + 1).fill(0) as number[]

  for (let i = 0; i < original.length; i++) {
    counts[original[i] - min] += 1
    yield {
      codeLine: 6,
      description: `Counting value ${original[i]}. Frequency is now ${counts[original[i] - min]}.`,
      state: { array: [...data], comparingIndices: [i], pivotIndex: i },
    }
  }

  let writeIndex = 0
  const sortedIndices: number[] = []

  for (let bucket = 0; bucket < counts.length; bucket++) {
    while (counts[bucket] > 0) {
      data[writeIndex] = bucket + min
      sortedIndices.push(writeIndex)
      counts[bucket] -= 1
      yield {
        codeLine: 11,
        description: `Writing ${bucket + min} from count bucket into index ${writeIndex}.`,
        state: { array: [...data], swappingIndices: [writeIndex], sortedIndices: [...sortedIndices] },
      }
      writeIndex += 1
    }
  }

  yield {
    codeLine: 16,
    description: 'Counting Sort complete! Frequencies rebuilt the array in order.',
    state: { array: [...data], sortedIndices: Array.from({ length: data.length }, (_, index) => index) },
  }
}
