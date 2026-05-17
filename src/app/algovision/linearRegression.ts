import { AlgorithmStep, Language } from '../types'

export const linearRegressionCode: Record<Language, string> = {
  typescript: `function linearRegression(points, epochs, lr) {
  let m = 0, b = 0;
  for (let i = 0; i < epochs; i++) {
    for (let p of points) {
      let guess = m * p.x + b;
      let error = p.y - guess;
      m += error * p.x * lr;
      b += error * lr;
    }
  }
}`,
  python: `def linear_regression(points, epochs, lr):
    m = b = 0
    for _ in range(epochs):
        for x, y in points:
            guess = m * x + b
            error = y - guess
            m += error * x * lr
            b += error * lr`,
  javascript: `function linearRegression(points, epochs, lr) {
  let m = 0, b = 0;
  for (let i = 0; i < epochs; i++) {
    for (const p of points) {
      const guess = m * p.x + b;
      const error = p.y - guess;
      m += error * p.x * lr;
      b += error * lr;
    }
  }
}`,
  cpp: `void linearRegression(vector<Point> points, int epochs, float lr) {
    float m = 0, b = 0;
    for (int i = 0; i < epochs; i++) {
        for (auto p : points) {
            float guess = m * p.x + b;
            float error = p.y - guess;
            m += error * p.x * lr;
            b += error * lr;
        }
    }
}`
}

export function* linearRegressionGenerator(_data?: unknown): Generator<AlgorithmStep> {
  // Generate noisy data around y = 0.5x + 20
  const points = Array.from({ length: 50 }, () => {
    const x = Math.random() * 80 + 10
    const y = 0.5 * x + 20 + (Math.random() - 0.5) * 15
    return { x, y }
  })

  let m = 0
  let b = 0
  const lr = 0.0001
  const epochs = 100

  yield {
    codeLine: 2,
    description: 'Initializing slope (m) and intercept (b) to 0.',
    state: { points: [...points], line: { x1: 0, y1: b, x2: 100, y2: m * 100 + b } }
  }

  for (let i = 0; i < epochs; i++) {
    for (let j = 0; j < points.length; j++) {
      const p = points[j]
      const guess = m * p.x + b
      const error = p.y - guess
      
      m += error * p.x * lr
      b += error * lr

      if (j % 10 === 0 && i % 2 === 0) {
        yield {
          codeLine: 7,
          description: `Epoch ${i+1}/${epochs}. Updating line using point (${p.x.toFixed(1)}, ${p.y.toFixed(1)}). Error: ${error.toFixed(2)}.`,
          state: { 
            points: [...points], 
            line: { x1: 0, y1: b, x2: 100, y2: m * 100 + b }
          }
        }
      }
    }
  }

  yield {
    codeLine: 1,
    description: 'Linear Regression complete! The line has been fitted to the data.',
    state: { 
      points: [...points], 
      line: { x1: 0, y1: b, x2: 100, y2: m * 100 + b }
    }
  }
}
