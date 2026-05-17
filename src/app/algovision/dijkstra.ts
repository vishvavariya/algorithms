import { AlgorithmStep, Language, GraphNode, GraphEdge } from '../types'

export const dijkstraCode: Record<Language, string> = {
  typescript: `function dijkstra(graph, startNode) {
  let distances = {};
  let visited = new Set();
  let pq = new PriorityQueue();

  distances[startNode] = 0;
  pq.enqueue(startNode, 0);

  while (!pq.isEmpty()) {
    let { node } = pq.dequeue();
    visited.add(node);

    for (let neighbor in graph[node]) {
      let distance = distances[node] + graph[node][neighbor];
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        pq.enqueue(neighbor, distance);
      }
    }
  }
}`,
  python: `def dijkstra(graph, start):
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    pq = [(0, start)]

    while pq:
        current_distance, current_node = heapq.heappop(pq)
        if current_distance > distances[current_node]:
            continue

        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))`,
  javascript: `function dijkstra(graph, startNode) {
  const distances = {};
  const visited = new Set();
  const pq = [[startNode, 0]];

  distances[startNode] = 0;

  while (pq.length > 0) {
    pq.sort((a, b) => a[1] - b[1]);
    const [node, dist] = pq.shift();
    visited.add(node);

    for (const neighbor in graph[node]) {
      const distance = distances[node] + graph[node][neighbor];
      if (distance < (distances[neighbor] || Infinity)) {
        distances[neighbor] = distance;
        pq.push([neighbor, distance]);
      }
    }
  }
}`,
  cpp: `void dijkstra(int startNode) {
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    dist[startNode] = 0;
    pq.push({0, startNode});

    while (!pq.empty()) {
        int u = pq.top().second;
        pq.pop();

        for (auto& edge : adj[u]) {
            int v = edge.first;
            int weight = edge.second;
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
}`
}

export function* dijkstraGenerator(): Generator<AlgorithmStep> {
  const nodes = [
    { id: 'A', x: 20, y: 30, label: 'A' },
    { id: 'B', x: 50, y: 20, label: 'B' },
    { id: 'C', x: 80, y: 30, label: 'C' },
    { id: 'D', x: 20, y: 70, label: 'D' },
    { id: 'E', x: 50, y: 80, label: 'E' },
    { id: 'F', x: 80, y: 70, label: 'F' },
  ]

  const edges = [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'D', weight: 2 },
    { from: 'B', to: 'C', weight: 3 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'B', to: 'E', weight: 10 },
    { from: 'C', to: 'E', weight: 2 },
    { from: 'C', to: 'F', weight: 5 },
    { from: 'D', to: 'E', weight: 3 },
    { from: 'E', to: 'F', weight: 4 },
  ]

  const graphNodes: GraphNode[] = nodes.map(n => ({ ...n, state: 'idle' }))
  const graphEdges: GraphEdge[] = edges.map(e => ({ ...e, state: 'idle' }))

  const distances: Record<string, number> = { A: 0 }
  const visited = new Set<string>()
  const pq: { node: string; dist: number }[] = [{ node: 'A', dist: 0 }]

  yield {
    codeLine: 9,
    description: 'Starting Dijkstra from node A. Distance to A is 0, all others Infinity.',
    state: { nodes: [...graphNodes], edges: [...graphEdges] }
  }

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist)
    const current = pq.shift()!
    const { node: u, dist: d } = current

    if (visited.has(u)) continue
    visited.add(u)

    // Highlight current node
    const nodeIdx = graphNodes.findIndex(n => n.id === u)
    graphNodes[nodeIdx] = { ...graphNodes[nodeIdx], state: 'visiting' }

    yield {
      codeLine: 13,
      description: `Exploring neighbors of node ${u}. Current shortest distance to ${u} is ${d}.`,
      state: { nodes: [...graphNodes], edges: [...graphEdges] }
    }

    const neighbors = edges.filter(e => e.from === u || e.to === u)
    for (const edge of neighbors) {
      const v = edge.from === u ? edge.to : edge.from
      const weight = edge.weight!
      const newDist = d + weight

      // Highlight edge being explored
      const edgeIdx = graphEdges.findIndex(e => (e.from === u && e.to === v) || (e.from === v && e.to === u))
      graphEdges[edgeIdx] = { ...graphEdges[edgeIdx], state: 'visiting' }

      yield {
        codeLine: 17,
        description: `Checking edge ${u} to ${v} (weight ${weight}). New distance to ${v} would be ${newDist}.`,
        state: { nodes: [...graphNodes], edges: [...graphEdges] }
      }

      if (distances[v] === undefined || newDist < distances[v]) {
        distances[v] = newDist
        pq.push({ node: v, dist: newDist })
        graphEdges[edgeIdx] = { ...graphEdges[edgeIdx], state: 'path' }
        
        const targetNodeIdx = graphNodes.findIndex(n => n.id === v)
        graphNodes[targetNodeIdx] = { ...graphNodes[targetNodeIdx], label: `${v}(${newDist})` }

        yield {
          codeLine: 19,
          description: `Updated shortest distance to ${v} to ${newDist}.`,
          state: { nodes: [...graphNodes], edges: [...graphEdges] }
        }
      } else {
        graphEdges[edgeIdx] = { ...graphEdges[edgeIdx], state: 'visited' }
      }
    }

    graphNodes[nodeIdx] = { ...graphNodes[nodeIdx], state: 'visited' }
  }

  yield {
    codeLine: 24,
    description: 'Dijkstra complete! All shortest paths found.',
    state: { nodes: [...graphNodes], edges: [...graphEdges] }
  }
}
