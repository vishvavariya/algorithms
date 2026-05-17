import { AlgorithmStep, Language, GraphNode, GraphEdge } from '../types'

export const aStarCode: Record<Language, string> = {
  typescript: `function aStar(start, goal, h) {
  let openSet = [start];
  let gScore = { [start]: 0 };
  let fScore = { [start]: h(start) };

  while (openSet.length > 0) {
    let current = getLowestFScore(openSet, fScore);
    if (current === goal) return reconstructPath(current);

    openSet.remove(current);
    for (let neighbor of neighbors(current)) {
      let tentativeG = gScore[current] + dist(current, neighbor);
      if (tentativeG < gScore[neighbor]) {
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = gScore[neighbor] + h(neighbor);
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
  }
}`,
  python: `def a_star(start, goal, h):
    open_set = {start}
    g_score = {start: 0}
    f_score = {start: h(start)}

    while open_set:
        current = min(open_set, key=lambda x: f_score[x])
        if current == goal:
            return reconstruct_path(current)

        open_set.remove(current)
        for neighbor in neighbors(current):
            tentative_g = g_score[current] + dist(current, neighbor)
            if tentative_g < g_score.get(neighbor, float('inf')):
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + h(neighbor)
                open_set.add(neighbor)`,
  javascript: `function aStar(start, goal, h) {
  const openSet = [start];
  const gScore = { [start]: 0 };
  const fScore = { [start]: h(start) };

  while (openSet.length > 0) {
    const current = openSet.reduce((a, b) => fScore[a] < fScore[b] ? a : b);
    if (current === goal) return true;

    openSet.splice(openSet.indexOf(current), 1);
    for (const neighbor of graph[current]) {
      const tentativeG = gScore[current] + weight(current, neighbor);
      if (tentativeG < (gScore[neighbor] || Infinity)) {
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = tentativeG + h(neighbor, goal);
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
  }
}`,
  cpp: `void aStar(Node* start, Node* goal) {
    priority_queue<pair<int, Node*>> openSet;
    openSet.push({0, start});
    gScore[start] = 0;

    while (!openSet.empty()) {
        Node* current = openSet.top().second;
        if (current == goal) break;
        openSet.pop();

        for (auto neighbor : current->adj) {
            int tentativeG = gScore[current] + dist(current, neighbor);
            if (tentativeG < gScore[neighbor]) {
                gScore[neighbor] = tentativeG;
                fScore[neighbor] = tentativeG + heuristic(neighbor, goal);
                openSet.push({-fScore[neighbor], neighbor});
            }
        }
    }
}`
}

export function* aStarGenerator(): Generator<AlgorithmStep> {
  const nodes = [
    { id: 'S', x: 10, y: 50, label: 'Start' },
    { id: 'A', x: 30, y: 20, label: 'A' },
    { id: 'B', x: 30, y: 80, label: 'B' },
    { id: 'C', x: 50, y: 50, label: 'C' },
    { id: 'D', x: 70, y: 20, label: 'D' },
    { id: 'E', x: 70, y: 80, label: 'E' },
    { id: 'G', x: 90, y: 50, label: 'Goal' },
  ]

  const edges = [
    { from: 'S', to: 'A', weight: 5 },
    { from: 'S', to: 'B', weight: 5 },
    { from: 'A', to: 'C', weight: 4 },
    { from: 'B', to: 'C', weight: 4 },
    { from: 'C', to: 'D', weight: 4 },
    { from: 'C', to: 'E', weight: 4 },
    { from: 'D', to: 'G', weight: 5 },
    { from: 'E', to: 'G', weight: 5 },
  ]

  const goal = nodes.find(n => n.id === 'G')!
  const heuristic = (n: typeof nodes[0]) => Math.sqrt((n.x - goal.x) ** 2 + (n.y - goal.y) ** 2) / 10

  const graphNodes: GraphNode[] = nodes.map(n => ({ ...n, label: `${n.id} (h=${heuristic(n).toFixed(1)})`, state: 'idle' }))
  const graphEdges: GraphEdge[] = edges.map(e => ({ ...e, state: 'idle' }))

  const gScore: Record<string, number> = { S: 0 }
  const fScore: Record<string, number> = { S: heuristic(nodes[0]) }
  const openSet = ['S']

  yield {
    codeLine: 4,
    description: 'Starting A* Search. Calculating heuristic (distance to goal) for each node.',
    state: { nodes: [...graphNodes], edges: [...graphEdges] }
  }

  while (openSet.length > 0) {
    const currentId = openSet.reduce((a, b) => fScore[a] < fScore[b] ? a : b)
    const currentIdx = graphNodes.findIndex(n => n.id === currentId)
    
    if (currentId === 'G') {
      graphNodes[currentIdx] = { ...graphNodes[currentIdx], state: 'path' }
      yield {
        codeLine: 8,
        description: 'Goal reached! Pathfinding complete.',
        state: { nodes: [...graphNodes], edges: [...graphEdges] }
      }
      return
    }

    openSet.splice(openSet.indexOf(currentId), 1)
    graphNodes[currentIdx] = { ...graphNodes[currentIdx], state: 'visiting' }

    yield {
      codeLine: 7,
      description: `Picking node ${currentId} with lowest fScore (${fScore[currentId].toFixed(1)}).`,
      state: { nodes: [...graphNodes], edges: [...graphEdges] }
    }

    const neighbors = edges.filter(e => e.from === currentId || e.to === currentId)
    for (const edge of neighbors) {
      const neighborId = edge.from === currentId ? edge.to : edge.from
      const tentativeG = gScore[currentId] + edge.weight!
      
      const edgeIdx = graphEdges.findIndex(e => (e.from === currentId && e.to === neighborId) || (e.from === neighborId && e.to === currentId))
      graphEdges[edgeIdx] = { ...graphEdges[edgeIdx], state: 'visiting' }

      yield {
        codeLine: 12,
        description: `Checking neighbor ${neighborId}. Tentative gScore: ${tentativeG.toFixed(1)}.`,
        state: { nodes: [...graphNodes], edges: [...graphEdges] }
      }

      if (gScore[neighborId] === undefined || tentativeG < gScore[neighborId]) {
        gScore[neighborId] = tentativeG
        const h = heuristic(nodes.find(n => n.id === neighborId)!)
        fScore[neighborId] = tentativeG + h
        
        if (!openSet.includes(neighborId)) openSet.push(neighborId)
        
        graphEdges[edgeIdx] = { ...graphEdges[edgeIdx], state: 'path' }
        const targetIdx = graphNodes.findIndex(n => n.id === neighborId)
        graphNodes[targetIdx] = { ...graphNodes[targetIdx], label: `${neighborId} (f=${fScore[neighborId].toFixed(1)})` }

        yield {
          codeLine: 14,
          description: `Updated scores for ${neighborId}. fScore = g(${tentativeG.toFixed(1)}) + h(${h.toFixed(1)}) = ${fScore[neighborId].toFixed(1)}.`,
          state: { nodes: [...graphNodes], edges: [...graphEdges] }
        }
      } else {
        graphEdges[edgeIdx] = { ...graphEdges[edgeIdx], state: 'visited' }
      }
    }

    graphNodes[currentIdx] = { ...graphNodes[currentIdx], state: 'visited' }
  }

  yield {
    codeLine: 1,
    description: 'A* Search complete!',
    state: { nodes: [...graphNodes], edges: [...graphEdges] }
  }
}
