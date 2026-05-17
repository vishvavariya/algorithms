import { AlgorithmStep, Language } from '../types'

export const kMeansCode: Record<Language, string> = {
  typescript: `function kMeans(points, k) {
  let centroids = initCentroids(points, k);
  while (notConverged) {
    assignPointsToClusters(points, centroids);
    updateCentroids(points, centroids);
  }
}`,
  python: `def k_means(points, k):
    centroids = initialize_centroids(points, k)
    while True:
        clusters = assign_clusters(points, centroids)
        new_centroids = update_centroids(points, clusters)
        if centroids == new_centroids:
            break
        centroids = new_centroids`,
  javascript: `function kMeans(points, k) {
  let centroids = initialize(points, k);
  let finished = false;
  while (!finished) {
    assignClusters(points, centroids);
    const oldCentroids = [...centroids];
    updateCentroids(points, centroids);
    finished = checkConvergence(oldCentroids, centroids);
  }
}`,
  cpp: `void kMeans(vector<Point>& points, int k) {
    vector<Point> centroids = init(points, k);
    while (true) {
        assign(points, centroids);
        vector<Point> old = centroids;
        update(points, centroids);
        if (converged(old, centroids)) break;
    }
}`
}

export function* kMeansGenerator(_data?: unknown): Generator<AlgorithmStep> {
  const points = Array.from({ length: 100 }, () => ({
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    cluster: undefined as number | undefined
  }))

  let centroids = [
    { x: 25, y: 25, cluster: 0 },
    { x: 75, y: 75, cluster: 1 },
    { x: 50, y: 50, cluster: 2 }
  ]

  yield {
    codeLine: 2,
    description: 'Initializing 3 centroids at random locations.',
    state: { points: [...points], centroids: [...centroids] }
  }

  let changed = true
  while (changed) {
    changed = false
    
    // Assign points to clusters
    points.forEach(p => {
      let minDist = Infinity
      let bestCluster = p.cluster
      centroids.forEach(c => {
        const dist = Math.sqrt((p.x - c.x) ** 2 + (p.y - c.y) ** 2)
        if (dist < minDist) {
          minDist = dist
          bestCluster = c.cluster
        }
      })
      if (p.cluster !== bestCluster) {
        p.cluster = bestCluster
        changed = true
      }
    })

    yield {
      codeLine: 4,
      description: 'Assigning each point to its nearest centroid.',
      state: { points: [...points.map(p => ({...p}))], centroids: [...centroids] }
    }

    if (!changed) break

    // Update centroids
    const newCentroids = centroids.map(c => {
      const clusterPoints = points.filter(p => p.cluster === c.cluster)
      if (clusterPoints.length === 0) return c
      const avgX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length
      const avgY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length
      return { ...c, x: avgX, y: avgY }
    })

    centroids = newCentroids
    yield {
      codeLine: 5,
      description: 'Recalculating centroids as the mean of their assigned points.',
      state: { points: [...points.map(p => ({...p}))], centroids: [...centroids] }
    }
  }

  yield {
    codeLine: 3,
    description: 'K-Means complete! Centroids have converged.',
    state: { points: [...points.map(p => ({...p}))], centroids: [...centroids] }
  }
}
