export type AlgorithmId = 
  | 'bubble-sort' | 'quick-sort' | 'insertion-sort' | 'selection-sort' | 'merge-sort' | 'heap-sort' | 'counting-sort' | 'social-sort'
  | 'linear-search' | 'binary-search' | 'jump-search'
  | 'dijkstra' | 'bellman-ford' | 'bfs' | 'dfs' | 'a-star'
  | 'k-means' | 'linear-regression'
  | 'n-queens' | 'fibonacci'

export type Category = {
  id: string
  label: string
  description: string
  icon: string
}

export type NodeState = 'idle' | 'visiting' | 'visited' | 'path'

export interface GraphNode {
  id: string
  x: number
  y: number
  label: string
  state?: NodeState
}

export interface GraphEdge {
  from: string
  to: string
  weight?: number
  state?: NodeState
}

export type VisualType = 'array' | 'graph' | 'grid' | 'scatter' | 'tree' | 'neural'

export interface PhysicsEvent {
  type: 'impact' | 'glow' | 'shake'
  intensity: number
}

export interface AlgorithmState {
  array?: number[]
  highlightedIndices?: number[]
  sortedIndices?: number[]
  comparingIndices?: number[]
  swappingIndices?: number[]
  pivotIndex?: number
  foundIndex?: number
  // Graphs
  nodes?: GraphNode[]
  edges?: GraphEdge[]
  // ML / Scatter
  points?: { x: number; y: number; cluster?: number }[]
  centroids?: { x: number; y: number; cluster: number }[]
  line?: { x1: number; y1: number; x2: number; y2: number }
  // Backtracking / Grid
  grid?: (number | string | null)[][]
  physicsEvent?: PhysicsEvent
}

export type AlgorithmStep = {
  codeLine: number
  description: string
  state: AlgorithmState
}

export type Language = 'typescript' | 'python' | 'cpp' | 'javascript'

export interface BattleState {
  isBattleMode: boolean
  leftId: AlgorithmId
  rightId: AlgorithmId
}

export interface LearnerProfile {
  palette: string
  metaphor: string
  watch: string
  tryThis: string
  hook: string
}
