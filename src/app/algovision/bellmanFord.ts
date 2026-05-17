import { AlgorithmStep, Language, GraphEdge, GraphNode } from '../types'

export const bellmanFordCode: Record<Language, string> = {
  typescript: `function bellmanFord(edges, vertices, source) {
  const dist = Object.fromEntries(vertices.map(v => [v, Infinity]));
  dist[source] = 0;

  for (let i = 0; i < vertices.length - 1; i++) {
    for (const [u, v, weight] of edges) {
      if (dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
      }
    }
  }
  return dist;
}`,
  python: `def bellman_ford(edges, vertices, source):
    dist = {v: float("inf") for v in vertices}
    dist[source] = 0

    for _ in range(len(vertices) - 1):
        for u, v, weight in edges:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
    return dist`,
  javascript: `function bellmanFord(edges, vertices, source) {
  const dist = Object.fromEntries(vertices.map(v => [v, Infinity]));
  dist[source] = 0;

  for (let i = 0; i < vertices.length - 1; i++) {
    for (const [u, v, weight] of edges) {
      if (dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
      }
    }
  }
  return dist;
}`,
  cpp: `vector<int> bellmanFord(vector<Edge>& edges, int vertices, int source) {
    vector<int> dist(vertices, INF);
    dist[source] = 0;

    for (int i = 0; i < vertices - 1; i++) {
        for (auto edge : edges) {
            if (dist[edge.u] + edge.weight < dist[edge.v]) {
                dist[edge.v] = dist[edge.u] + edge.weight;
            }
        }
    }
    return dist;
}`
}

export function* bellmanFordGenerator(): Generator<AlgorithmStep> {
  const nodes = [
    { id: 'A', x: 14, y: 50, label: 'A' },
    { id: 'B', x: 36, y: 24, label: 'B' },
    { id: 'C', x: 62, y: 24, label: 'C' },
    { id: 'D', x: 38, y: 76, label: 'D' },
    { id: 'E', x: 68, y: 72, label: 'E' },
    { id: 'F', x: 86, y: 48, label: 'F' },
  ]

  const edges = [
    { from: 'A', to: 'B', weight: 6 },
    { from: 'A', to: 'D', weight: 7 },
    { from: 'B', to: 'C', weight: 5 },
    { from: 'B', to: 'D', weight: 8 },
    { from: 'B', to: 'E', weight: -4 },
    { from: 'C', to: 'B', weight: -2 },
    { from: 'D', to: 'C', weight: -3 },
    { from: 'D', to: 'E', weight: 9 },
    { from: 'E', to: 'F', weight: 2 },
    { from: 'F', to: 'C', weight: 7 },
  ]

  const graphNodes: GraphNode[] = nodes.map(node => ({ ...node, state: 'idle' }))
  const graphEdges: GraphEdge[] = edges.map(edge => ({ ...edge, state: 'idle' }))
  const distances: Record<string, number> = Object.fromEntries(nodes.map(node => [node.id, Infinity]))
  distances.A = 0

  yield {
    codeLine: 2,
    description: 'Starting Bellman-Ford from A. Every other distance begins as Infinity.',
    state: { nodes: labelDistances(graphNodes, distances), edges: [...graphEdges] },
  }

  for (let pass = 1; pass < nodes.length; pass++) {
    let changed = false
    yield {
      codeLine: 5,
      description: `Relaxation pass ${pass}. Every edge gets a chance to improve a distance.`,
      state: { nodes: labelDistances(graphNodes, distances), edges: [...graphEdges] },
    }

    for (let index = 0; index < edges.length; index++) {
      const edge = edges[index]
      graphEdges[index] = { ...graphEdges[index], state: 'visiting' }
      const candidate = distances[edge.from] + edge.weight!

      yield {
        codeLine: 6,
        description: `Testing ${edge.from} to ${edge.to} with weight ${edge.weight}. Candidate distance is ${Number.isFinite(candidate) ? candidate : 'Infinity'}.`,
        state: { nodes: labelDistances(graphNodes, distances, [edge.from, edge.to]), edges: [...graphEdges] },
      }

      if (candidate < distances[edge.to]) {
        distances[edge.to] = candidate
        changed = true
        graphEdges[index] = { ...graphEdges[index], state: 'path' }
        yield {
          codeLine: 8,
          description: `Relaxed ${edge.to}. New best distance is ${candidate}.`,
          state: { nodes: labelDistances(graphNodes, distances, [edge.to]), edges: [...graphEdges] },
        }
      } else {
        graphEdges[index] = { ...graphEdges[index], state: 'visited' }
      }
    }

    if (!changed) {
      yield {
        codeLine: 11,
        description: 'No distances changed on this pass, so the shortest paths are stable.',
        state: { nodes: labelDistances(graphNodes, distances), edges: [...graphEdges] },
      }
      break
    }
  }

  yield {
    codeLine: 13,
    description: 'Bellman-Ford complete! Negative edges were handled without panic.',
    state: { nodes: labelDistances(graphNodes, distances), edges: graphEdges.map(edge => ({ ...edge, state: edge.state === 'path' ? 'path' : 'visited' })) },
  }
}

function labelDistances(nodes: GraphNode[], distances: Record<string, number>, visiting: string[] = []) {
  return nodes.map(node => ({
    ...node,
    label: `${node.id}(${Number.isFinite(distances[node.id]) ? distances[node.id] : 'inf'})`,
    state: visiting.includes(node.id) ? 'visiting' as const : node.state,
  }))
}
