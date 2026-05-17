import { AlgorithmId, Category, Language, AlgorithmStep } from '../types'
import { bubbleSortCode, bubbleSortGenerator } from '../algovision/bubbleSort'
import { insertionSortCode, insertionSortGenerator } from '../algovision/insertionSort'
import { selectionSortCode, selectionSortGenerator } from '../algovision/selectionSort'
import { quickSortCode, quickSortGenerator } from '../algovision/quickSort'
import { heapSortCode, heapSortGenerator } from '../algovision/heapSort'
import { countingSortCode, countingSortGenerator } from '../algovision/countingSort'
import { mergeSortCode, mergeSortGenerator } from '../algovision/mergeSort'
import { linearSearchCode, linearSearchGenerator } from '../algovision/linearSearch'
import { binarySearchCode, binarySearchGenerator } from '../algovision/binarySearch'
import { jumpSearchCode, jumpSearchGenerator } from '../algovision/jumpSearch'
import { dijkstraCode, dijkstraGenerator } from '../algovision/dijkstra'
import { bellmanFordCode, bellmanFordGenerator } from '../algovision/bellmanFord'
import { bfsCode, bfsGenerator } from '../algovision/bfs'
import { dfsCode, dfsGenerator } from '../algovision/dfs'
import { aStarCode, aStarGenerator } from '../algovision/aStar'
import { kMeansCode, kMeansGenerator } from '../algovision/kMeans'
import { linearRegressionCode, linearRegressionGenerator } from '../algovision/linearRegression'
import { nQueensCode, nQueensGenerator } from '../algovision/nQueens'
import { fibonacciCode, fibonacciGenerator } from '../algovision/fibonacci'

export const CATEGORIES: Category[] = [
  {
    id: 'sorting',
    label: 'Sorting',
    description: 'Organizing elements in a specific order.',
    icon: 'bar-chart',
  },
  {
    id: 'searching',
    label: 'Searching',
    description: 'Finding specific elements within a dataset.',
    icon: 'search',
  },
  {
    id: 'graphs',
    label: 'Graphs',
    description: 'Networking and pathfinding between nodes.',
    icon: 'share-2',
  },
  {
    id: 'strategy',
    label: 'Strategy',
    description: 'Core algorithmic patterns and approaches.',
    icon: 'cpu',
  },
  {
    id: 'ml',
    label: 'Machine Learning',
    description: 'Predicting, classifying, and grouping data.',
    icon: 'brain',
  },
]

export const ALGORITHM_REGISTRY: Record<string, {
  id: AlgorithmId
  categoryId: string
  label: string
  description: string
  visualType: 'array' | 'graph' | 'grid' | 'scatter' | 'tree' | 'neural'
  timeComplexity: string
  spaceComplexity: string
  code: Record<Language, string>
  generator: (data: any, target?: any) => Generator<AlgorithmStep> // eslint-disable-line @typescript-eslint/no-explicit-any
}> = {
  'bubble-sort': {
    id: 'bubble-sort',
    categoryId: 'sorting',
    label: 'Bubble Sort',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    visualType: 'array',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: bubbleSortCode,
    generator: bubbleSortGenerator
  },
  'insertion-sort': {
    id: 'insertion-sort',
    categoryId: 'sorting',
    label: 'Insertion Sort',
    description: 'Builds the final sorted array one item at a time, much like sorting a hand of playing cards.',
    visualType: 'array',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: insertionSortCode,
    generator: insertionSortGenerator
  },
  'selection-sort': {
    id: 'selection-sort',
    categoryId: 'sorting',
    label: 'Selection Sort',
    description: 'Repeatedly finds the minimum element from the unsorted part and puts it at the beginning.',
    visualType: 'array',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: selectionSortCode,
    generator: selectionSortGenerator
  },
  'quick-sort': {
    id: 'quick-sort',
    categoryId: 'sorting',
    label: 'Quick Sort',
    description: 'A highly efficient sorting algorithm and is based on partitioning of array of data into smaller arrays.',
    visualType: 'array',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    code: quickSortCode,
    generator: quickSortGenerator
  },
  'heap-sort': {
    id: 'heap-sort',
    categoryId: 'sorting',
    label: 'Heap Sort',
    description: 'Builds a max heap, then repeatedly extracts the largest value into its final sorted position.',
    visualType: 'array',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    code: heapSortCode,
    generator: heapSortGenerator
  },
  'counting-sort': {
    id: 'counting-sort',
    categoryId: 'sorting',
    label: 'Counting Sort',
    description: 'Counts how often each value appears, then rebuilds the array from those frequencies.',
    visualType: 'array',
    timeComplexity: 'O(n + k)',
    spaceComplexity: 'O(k)',
    code: countingSortCode,
    generator: countingSortGenerator
  },
  'merge-sort': {
    id: 'merge-sort',
    categoryId: 'sorting',
    label: 'Merge Sort',
    description: 'A divide-and-conquer algorithm that divides an array into halves, sorts them, and then merges them back together.',
    visualType: 'array',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    code: mergeSortCode,
    generator: mergeSortGenerator
  },
  'linear-search': {
    id: 'linear-search',
    categoryId: 'searching',
    label: 'Linear Search',
    description: 'Sequential search algorithm that starts at one end and goes through each element until the desired element is found.',
    visualType: 'array',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: linearSearchCode,
    generator: linearSearchGenerator
  },
  'binary-search': {
    id: 'binary-search',
    categoryId: 'searching',
    label: 'Binary Search',
    description: 'Finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.',
    visualType: 'array',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    code: binarySearchCode,
    generator: binarySearchGenerator
  },
  'jump-search': {
    id: 'jump-search',
    categoryId: 'searching',
    label: 'Jump Search',
    description: 'Jumps through a sorted array by block size, then scans inside the block that could contain the target.',
    visualType: 'array',
    timeComplexity: 'O(√n)',
    spaceComplexity: 'O(1)',
    code: jumpSearchCode,
    generator: jumpSearchGenerator
  },
  'dfs': {
    id: 'dfs',
    categoryId: 'searching',
    label: 'Depth-First Search (DFS)',
    description: 'Explores as far as possible along each branch before backtracking.',
    visualType: 'graph',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    code: dfsCode,
    generator: dfsGenerator
  },
  'bfs': {
    id: 'bfs',
    categoryId: 'searching',
    label: 'Breadth-First Search (BFS)',
    description: 'Explores all neighbors at the present depth before moving to nodes at the next depth level.',
    visualType: 'graph',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    code: bfsCode,
    generator: bfsGenerator
  },
  'dijkstra': {
    id: 'dijkstra',
    categoryId: 'graphs',
    label: "Dijkstra's Algorithm",
    description: 'Finds the shortest path between nodes in a graph.',
    visualType: 'graph',
    timeComplexity: 'O(E + V log V)',
    spaceComplexity: 'O(V)',
    code: dijkstraCode,
    generator: dijkstraGenerator
  },
  'bellman-ford': {
    id: 'bellman-ford',
    categoryId: 'graphs',
    label: 'Bellman-Ford',
    description: 'Relaxes every edge repeatedly to find shortest paths, even when some edges have negative weights.',
    visualType: 'graph',
    timeComplexity: 'O(VE)',
    spaceComplexity: 'O(V)',
    code: bellmanFordCode,
    generator: bellmanFordGenerator
  },
  'a-star': {
    id: 'a-star',
    categoryId: 'graphs',
    label: 'A* Search',
    description: 'An informed search algorithm that uses a heuristic to find the shortest path more efficiently than Dijkstra.',
    visualType: 'graph',
    timeComplexity: 'O(E + V log V)',
    spaceComplexity: 'O(V)',
    code: aStarCode,
    generator: aStarGenerator
  },
  'k-means': {
    id: 'k-means',
    categoryId: 'ml',
    label: 'K-Means Clustering',
    description: 'Groups data points into K clusters based on similarity.',
    visualType: 'scatter',
    timeComplexity: 'O(n * k * i)',
    spaceComplexity: 'O(n + k)',
    code: kMeansCode,
    generator: kMeansGenerator
  },
  'linear-regression': {
    id: 'linear-regression',
    categoryId: 'ml',
    label: 'Linear Regression',
    description: 'A basic ML algorithm that models the relationship between a dependent variable and one or more independent variables by fitting a linear equation to observed data.',
    visualType: 'scatter',
    timeComplexity: 'O(n * epochs)',
    spaceComplexity: 'O(1)',
    code: linearRegressionCode,
    generator: linearRegressionGenerator
  },
  'n-queens': {
    id: 'n-queens',
    categoryId: 'strategy',
    label: 'N-Queens Backtracking',
    description: 'Place N queens on an NxN chessboard such that no two queens threaten each other.',
    visualType: 'grid',
    timeComplexity: 'O(N!)',
    spaceComplexity: 'O(N²)',
    code: nQueensCode,
    generator: nQueensGenerator
  },
  'fibonacci': {
    id: 'fibonacci',
    categoryId: 'strategy',
    label: 'Fibonacci (DP)',
    description: 'Calculates the Fibonacci sequence using dynamic programming (memoization) to optimize recursion.',
    visualType: 'grid',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: fibonacciCode,
    generator: fibonacciGenerator
  },
}

export const SEARCH_ALGORITHMS = new Set<AlgorithmId>([
  'linear-search',
  'binary-search',
  'jump-search',
  'dfs',
  'bfs',
  'a-star'
])
