import { AlgorithmStep, Language, GraphNode, GraphEdge } from '../types'

export const bfsCode: Record<Language, string> = {
  typescript: `function bfs(graph, startNode) {
  let queue = [startNode];
  let visited = new Set([startNode]);

  while (queue.length > 0) {
    let node = queue.shift();
    for (let neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}`,
  python: `def bfs(graph, start):
    queue = [start]
    visited = {start}
    while queue:
        node = queue.pop(0)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
  javascript: `function bfs(graph, startNode) {
  const queue = [startNode];
  const visited = new Set([startNode]);

  while (queue.length > 0) {
    const node = queue.shift();
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}`,
  cpp: `void bfs(int startNode) {
    queue<int> q;
    q.push(startNode);
    visited[startNode] = true;

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}`
}

export function* bfsGenerator(): Generator<AlgorithmStep> {
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

  const queue = ['A']
  const visited = new Set(['A'])

  yield {
    codeLine: 2,
    description: 'Starting BFS from node A. Queue: [A]',
    state: { nodes: [...graphNodes], edges: [...graphEdges] }
  }

  while (queue.length > 0) {
    const u = queue.shift()!
    
    // Highlight current node
    const nodeIdx = graphNodes.findIndex(n => n.id === u)
    graphNodes[nodeIdx] = { ...graphNodes[nodeIdx], state: 'visiting' }

    yield {
      codeLine: 6,
      description: `Dequeued node ${u}. Checking its neighbors.`,
      state: { nodes: [...graphNodes], edges: [...graphEdges] }
    }

    const neighbors = edges.filter(e => e.from === u || e.to === u)
    for (const edge of neighbors) {
      const v = edge.from === u ? edge.to : edge.from
      
      // Highlight edge being explored
      const edgeIdx = graphEdges.findIndex(e => (e.from === u && e.to === v) || (e.from === v && e.to === u))
      graphEdges[edgeIdx] = { ...graphEdges[edgeIdx], state: 'visiting' }

      yield {
        codeLine: 7,
        description: `Checking neighbor ${v}.`,
        state: { nodes: [...graphNodes], edges: [...graphEdges] }
      }

      if (!visited.has(v)) {
        visited.add(v)
        queue.push(v)
        graphEdges[edgeIdx] = { ...graphEdges[edgeIdx], state: 'visited' }
        
        const targetNodeIdx = graphNodes.findIndex(n => n.id === v)
        graphNodes[targetNodeIdx] = { ...graphNodes[targetNodeIdx], state: 'visiting' }

        yield {
          codeLine: 10,
          description: `Node ${v} not visited. Adding to queue. Queue: [${queue.join(', ')}]`,
          state: { nodes: [...graphNodes], edges: [...graphEdges] }
        }
      } else {
        graphEdges[edgeIdx] = { ...graphEdges[edgeIdx], state: 'idle' }
      }
    }

    graphNodes[nodeIdx] = { ...graphNodes[nodeIdx], state: 'visited' }
  }

  yield {
    codeLine: 13,
    description: 'BFS complete! All reachable nodes visited layer by layer.',
    state: { nodes: [...graphNodes], edges: [...graphEdges] }
  }
}
