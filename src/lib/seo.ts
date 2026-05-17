import type { Metadata } from 'next'
import { ALGORITHM_REGISTRY, CATEGORIES } from '@/app/data/registry'

export const SITE_ORIGIN = 'https://vishvavariya.github.io'
export const SITE_BASE_PATH = '/algovision'
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE_PATH}`
export const SITE_NAME = 'AlgoVision'
export const SITE_AUTHOR = {
  name: 'Vishva Variya',
  url: 'https://vishvavariya.com/',
}

export type SeoPageKey = 'home' | 'algovision'

export type SeoPage = {
  path: string
  title: string
  browserTitle?: string
  description: string
  keywords: string[]
  ogLabel: string
  ogTheme: string
  changeFrequency: 'weekly' | 'monthly' | 'daily'
  priority: number
  lastModified: string
  launchedAt?: string
}

const updatedAt = new Date().toISOString()

const HOME_PAGE: SeoPage = {
  path: '/',
  title: 'AlgoVision — Free Interactive Algorithm Visualizer in the Browser',
  browserTitle: 'AlgoVision — Interactive Algorithm Visualizer',
  description:
    'Free interactive algorithm visualizer. Step through Bubble Sort, Quick Sort, Merge Sort, Dijkstra, A*, BFS, DFS, Binary Search, K-Means, N-Queens, and more with live code traces in TypeScript, Python, C++, and JavaScript. No signup, runs entirely in your browser.',
  keywords: [
    'algorithm visualizer',
    'interactive algorithm visualizer',
    'sorting algorithm visualizer',
    'graph algorithm visualizer',
    'pathfinding visualizer',
    'dijkstra visualizer',
    'a star visualizer',
    'bfs dfs visualizer',
    'binary search visualizer',
    'bubble sort animation',
    'quick sort animation',
    'merge sort animation',
    'heap sort animation',
    'insertion sort visualization',
    'selection sort visualization',
    'data structures and algorithms',
    'dsa visualization',
    'learn algorithms online',
    'free algorithm visualizer',
    'algorithm step by step',
    'computer science learning tool',
    'leetcode prep visualizer',
    'k-means clustering visualizer',
    'linear regression visualizer',
    'n queens visualizer',
    'fibonacci visualization',
    'algorithm playground',
    'code execution visualizer',
  ],
  ogLabel: 'algorithm lab',
  ogTheme: 'algovision',
  changeFrequency: 'weekly',
  priority: 1,
  lastModified: updatedAt,
  launchedAt: '2026-05-08T00:30:00+02:00',
}

export const seoPages = {
  home: HOME_PAGE,
  algovision: HOME_PAGE,
} satisfies Record<SeoPageKey, SeoPage>

/** Resolve a path under the base path to a full absolute URL. */
export function absoluteUrl(path = '/') {
  const normalized = path === '/' ? '' : (path.startsWith('/') ? path : `/${path}`)
  return `${SITE_URL}${normalized}`
}

/** Resolve a route path *relative* to the basePath. Use in <Link href> + canonical. */
export function routePath(path = '/') {
  if (path === '/') return SITE_BASE_PATH
  return `${SITE_BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * OG image URL. Static SVG fallback by default — overrideable when a static PNG ships.
 * Path resolves under basePath so it works on GitHub Pages.
 */
export function ogImageUrl(_args?: { title?: string; description?: string; label?: string; theme?: string }) {
  void _args
  return `${SITE_URL}/og-default.svg`
}

export function createSeoMetadata({
  path,
  title,
  description,
  keywords,
  ogLabel,
  ogTheme,
  browserTitle,
  absoluteTitle = false,
}: Pick<SeoPage, 'path' | 'title' | 'description' | 'keywords' | 'ogLabel' | 'ogTheme' | 'browserTitle'> & {
  absoluteTitle?: boolean
}): Metadata {
  const url = absoluteUrl(path)
  const canonical = routePath(path)
  const metadataTitle = browserTitle ?? title
  const image = ogImageUrl({
    title,
    description,
    label: ogLabel,
    theme: ogTheme,
  })
  const socialTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`

  return {
    title: absoluteTitle ? { absolute: metadataTitle } : metadataTitle,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: socialTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      creator: '@vishvavariya',
      images: [image],
    },
  }
}

export function createPageMetadata(key: SeoPageKey): Metadata {
  return createSeoMetadata({
    ...seoPages[key],
    absoluteTitle: key === 'home',
  })
}

export function breadcrumbLd(crumbs: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-algorithm SEO. Slugs match registry IDs.
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c.label]),
)

const ALGO_KEYWORDS_EXTRA: Record<string, string[]> = {
  'bubble-sort': ['bubble sort visualizer', 'bubble sort step by step', 'bubble sort animation', 'bubble sort algorithm'],
  'insertion-sort': ['insertion sort visualizer', 'insertion sort animation', 'insertion sort step by step'],
  'selection-sort': ['selection sort visualizer', 'selection sort animation', 'selection sort step by step'],
  'quick-sort': ['quick sort visualizer', 'quicksort animation', 'quick sort partition visualization'],
  'merge-sort': ['merge sort visualizer', 'merge sort animation', 'divide and conquer visualizer'],
  'heap-sort': ['heap sort visualizer', 'heap sort animation', 'binary heap visualization'],
  'counting-sort': ['counting sort visualizer', 'counting sort animation', 'non comparison sort visualizer'],
  'linear-search': ['linear search visualizer', 'linear search animation'],
  'binary-search': ['binary search visualizer', 'binary search animation', 'binary search step by step'],
  'jump-search': ['jump search visualizer', 'jump search animation'],
  'dijkstra': ['dijkstra visualizer', 'dijkstra shortest path animation', 'dijkstra step by step'],
  'bellman-ford': ['bellman ford visualizer', 'bellman ford animation', 'negative weight shortest path'],
  'bfs': ['breadth first search visualizer', 'bfs animation', 'graph traversal visualizer'],
  'dfs': ['depth first search visualizer', 'dfs animation', 'graph traversal visualizer'],
  'a-star': ['a star pathfinding visualizer', 'a* algorithm animation', 'heuristic pathfinding'],
  'k-means': ['k means clustering visualizer', 'k means animation', 'unsupervised clustering visualizer'],
  'linear-regression': ['linear regression visualizer', 'gradient descent animation', 'least squares visualizer'],
  'n-queens': ['n queens visualizer', 'n queens backtracking', 'eight queens animation'],
  'fibonacci': ['fibonacci visualizer', 'fibonacci animation', 'dynamic programming visualizer'],
}

/** Get the SeoPage definition for a single algorithm slug. */
export function getAlgorithmSeoPage(slug: string): SeoPage | null {
  const algo = ALGORITHM_REGISTRY[slug]
  if (!algo) return null
  const category = CATEGORY_LABELS[algo.categoryId] || algo.categoryId
  const extra = ALGO_KEYWORDS_EXTRA[slug] || []
  const title = `${algo.label} Visualizer — Step-by-Step ${category} Algorithm Animation`
  const description = `Interactive ${algo.label} visualizer with step-by-step animation, live code trace, and complexity analysis. ${algo.description} Time complexity ${algo.timeComplexity}, space complexity ${algo.spaceComplexity}. Free, in-browser, no signup.`
  return {
    path: `/${slug}`,
    title,
    browserTitle: `${algo.label} Visualizer`,
    description,
    keywords: [
      ...extra,
      `${algo.label.toLowerCase()} algorithm`,
      `${algo.label.toLowerCase()} explained`,
      `${category.toLowerCase()} algorithm`,
      'algorithm visualizer',
      'interactive algorithm',
      'learn algorithms',
      'dsa visualization',
    ],
    ogLabel: algo.label.toLowerCase(),
    ogTheme: 'algovision',
    changeFrequency: 'weekly',
    priority: 0.9,
    lastModified: updatedAt,
  }
}

export function createAlgorithmMetadata(slug: string): Metadata | null {
  const page = getAlgorithmSeoPage(slug)
  if (!page) return null
  return createSeoMetadata(page)
}

/** All real routes that ship in this static export. Used by sitemap. */
export function allSitemapPages(): SeoPage[] {
  const home = HOME_PAGE
  const algoPages = Object.keys(ALGORITHM_REGISTRY)
    .map(getAlgorithmSeoPage)
    .filter((p): p is SeoPage => p !== null)
  return [home, ...algoPages]
}
