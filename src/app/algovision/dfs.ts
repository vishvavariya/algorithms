import { AlgorithmStep, Language, GraphNode, GraphEdge } from '../types'

export const dfsCode: Record<Language, string> = {
  typescript: `function dfs(node, visited = new Set()) {
  visited.add(node);
  for (let neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      dfs(neighbor, visited);
    }
  }
}`,
  python: `def dfs(node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(neighbor, visited)`,
  javascript: `function dfs(node, visited = new Set()) {
  visited.add(node);
  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      dfs(neighbor, visited);
    }
  }
}`,
  cpp: `void dfs(int u) {
    visited[u] = true;
    for (int v : adj[u]) {
        if (!visited[v]) {
            dfs(v);
        }
    }
}`
}

export function* dfsGenerator(): Generator<AlgorithmStep> {
  const nodes = [
    { id: 'A', x: 50, y: 10, label: 'A' },
    { id: 'B', x: 30, y: 40, label: 'B' },
    { id: 'C', x: 70, y: 40, label: 'C' },
    { id: 'D', x: 20, y: 70, label: 'D' },
    { id: 'E', x: 40, y: 70, label: 'E' },
    { id: 'F', x: 60, y: 70, label: 'F' },
    { id: 'G', x: 80, y: 70, label: 'G' },
  ]

  const edges = [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'B', to: 'E' },
    { from: 'C', to: 'F' },
    { from: 'C', to: 'G' },
  ]

  const graphNodes: GraphNode[] = nodes.map(n => ({ ...n, state: 'idle' }))
  const graphEdges: GraphEdge[] = edges.map(e => ({ ...e, state: 'idle' }))

  const visited = new Set<string>()

  function* visit(u: string): Generator<AlgorithmStep> {
    visited.add(u)
    const nodeIdx = graphNodes.findIndex(n => n.id === u)
    graphNodes[nodeIdx] = { ...graphNodes[nodeIdx], state: 'visiting' }

    yield {
      codeLine: 2,
      description: `Visiting node ${u}. Adding to visited set.`,
      state: { nodes: [...graphNodes], edges: [...graphEdges] }
    }

    const neighbors = edges.filter(e => e.from === u || e.to === u)
    for (const edge of neighbors) {
      const v = edge.from === u ? edge.to : edge.from
      const edgeIdx = graphEdges.findIndex(e => (e.from === u && e.to === v) || (e.from === v && e.to === u))
      
      if (!visited.has(v)) {
        graphEdges[edgeIdx] = { ...graphEdges[edgeIdx], state: 'visiting' }
        yield {
          codeLine: 4,
          description: `Neighbor ${v} not visited. Moving deeper to ${v}.`,
          state: { nodes: [...graphNodes], edges: [...graphEdges] }
        }
        yield* visit(v)
        graphEdges[edgeIdx] = { ...graphEdges[edgeIdx], state: 'visited' }
      } else {
        yield {
          codeLine: 4,
          description: `Neighbor ${v} already visited. Skipping.`,
          state: { nodes: [...graphNodes], edges: [...graphEdges] }
        }
      }
    }

    graphNodes[nodeIdx] = { ...graphNodes[nodeIdx], state: 'visited' }
    yield {
      codeLine: 2,
      description: `Backtracking from node ${u}.`,
      state: { nodes: [...graphNodes], edges: [...graphEdges] }
    }
  }

  yield* visit('A')

  yield {
    codeLine: 1,
    description: 'DFS complete! Explored the graph as deep as possible before backtracking.',
    state: { nodes: [...graphNodes], edges: [...graphEdges] }
  }
}
