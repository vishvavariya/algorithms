import { LearnerProfile } from '../types'

export const LEARNER_PROFILES: Record<string, LearnerProfile> = {
  array: {
    palette: 'from-cyan-400 to-blue-500',
    metaphor: 'Like organizing a bookshelf by height.',
    watch: 'Notice how elements swap positions.',
    tryThis: 'Try with a reversed array.',
    hook: 'Sorting linear data structures.'
  },
  graph: {
    palette: 'from-emerald-400 to-teal-500',
    metaphor: 'Like finding the best route on a map.',
    watch: 'Observe which nodes are visited first.',
    tryThis: 'Change the start node.',
    hook: 'Exploring connections and paths.'
  },
  grid: {
    palette: 'from-amber-400 to-orange-500',
    metaphor: 'Like solving a puzzle on a board.',
    watch: 'Watch the pattern emerge on the grid.',
    tryThis: 'Adjust the grid size.',
    hook: 'Matrix and coordinate operations.'
  },
  scatter: {
    palette: 'from-pink-400 to-rose-500',
    metaphor: 'Like grouping stars in the night sky.',
    watch: 'See how clusters form over time.',
    tryThis: 'Change the number of clusters.',
    hook: 'Clustering and statistical data.'
  },
  tree: {
    palette: 'from-purple-400 to-indigo-500',
    metaphor: 'Like following family branches.',
    watch: 'Follow the hierarchy from top to bottom.',
    tryThis: 'Insert a new node.',
    hook: 'Hierarchical data structures.'
  },
  neural: {
    palette: 'from-blue-600 to-indigo-700',
    metaphor: 'Like layers of a brain processing signals.',
    watch: 'Observe how weights change as signals flow.',
    tryThis: 'Change the activation function.',
    hook: 'Neural network and deep learning.'
  }
}
