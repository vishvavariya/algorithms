import Link from 'next/link'
import { ALGORITHM_REGISTRY, CATEGORIES } from '../data/registry'
import { StructuredData } from '@/components/StructuredData'
import { absoluteUrl, breadcrumbLd, routePath, SITE_NAME, SITE_URL } from '@/lib/seo'

interface SeoContentProps {
  /** Algorithm slug, or 'home' for the hub page. */
  slug: string
}

interface AlgorithmSummary {
  id: string
  label: string
  description: string
  categoryId: string
  categoryLabel: string
  timeComplexity: string
  spaceComplexity: string
}

function getAllAlgorithmSummaries(): AlgorithmSummary[] {
  const categoryMap: Record<string, string> = Object.fromEntries(
    CATEGORIES.map(c => [c.id, c.label]),
  )
  return Object.values(ALGORITHM_REGISTRY).map(a => ({
    id: a.id,
    label: a.label,
    description: a.description,
    categoryId: a.categoryId,
    categoryLabel: categoryMap[a.categoryId] || a.categoryId,
    timeComplexity: a.timeComplexity,
    spaceComplexity: a.spaceComplexity,
  }))
}

const FAQ = [
  {
    q: 'What is an algorithm visualizer?',
    a: 'An algorithm visualizer is an interactive tool that animates each step of an algorithm — comparisons, swaps, graph traversals, partitions — so you can see exactly how the logic moves data. AlgoVision pairs the animation with a live code trace so you can map the visual to the line of code executing right now.',
  },
  {
    q: 'Is AlgoVision free?',
    a: 'Yes. Every algorithm, every language, every visualization is free with no signup. Runs entirely in your browser — your input data never leaves the page.',
  },
  {
    q: 'Which programming languages are supported?',
    a: 'Each algorithm ships with reference implementations in TypeScript, JavaScript, Python, and C++. You can switch language at any time without losing the playback position.',
  },
  {
    q: 'Can I use my own input data?',
    a: 'Yes — open the Laboratory panel (gear icon) to load presets (random, reversed, nearly-sorted, duplicates) or paste a custom comma-separated list. For search algorithms you can also set the target value.',
  },
  {
    q: 'Can I compare two algorithms side by side?',
    a: 'Yes. Click the Battle button in the header to run any two algorithms on the same dataset side-by-side. Useful for understanding why one approach is faster (e.g. Bubble Sort vs Quick Sort on a reversed array).',
  },
  {
    q: 'Which algorithms are included?',
    a: 'AlgoVision covers sorting (Bubble, Insertion, Selection, Quick, Merge, Heap, Counting), searching (Linear, Binary, Jump), graph (Dijkstra, Bellman–Ford, BFS, DFS, A*), machine learning (K-Means, Linear Regression), and strategy (N-Queens, Fibonacci). New ones ship regularly.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes — the UI adapts to small screens and a landscape hint appears on phones. Full keyboard shortcuts and resizing are available on tablet and desktop.',
  },
  {
    q: 'Can I share a specific run?',
    a: 'Yes. The Share button copies a deep link that encodes the selected algorithm, dataset, and battle pairing, so anyone opening it lands on exactly the same configuration.',
  },
]

export function SeoContent({ slug }: SeoContentProps) {
  const algorithms = getAllAlgorithmSummaries()
  const isAlgorithm = slug !== 'home' && slug in ALGORITHM_REGISTRY
  const current = isAlgorithm ? ALGORITHM_REGISTRY[slug] : null
  const currentSummary = isAlgorithm
    ? algorithms.find(a => a.id === slug) ?? null
    : null

  const byCategory: Record<string, AlgorithmSummary[]> = {}
  for (const a of algorithms) {
    byCategory[a.categoryId] ??= []
    byCategory[a.categoryId].push(a)
  }

  const breadcrumbs = isAlgorithm && currentSummary
    ? [
        { name: 'AlgoVision', path: '/' },
        { name: currentSummary.categoryLabel, path: '/' },
        { name: currentSummary.label, path: `/${currentSummary.id}` },
      ]
    : [{ name: 'AlgoVision', path: '/' }]

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE_NAME} — Algovision`,
    itemListElement: algorithms.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/${a.id}`),
      name: `${a.label} Visualizer`,
      description: a.description,
    })),
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  const courseLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'AlgoVision — Visual Guide to Core Algorithms',
    description:
      'A free interactive course covering sorting, searching, graph, pathfinding, and machine learning algorithms with step-by-step animations and live code traces.',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT2H',
      inLanguage: 'en',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'Free',
    },
  }

  const learningResourceLd = current && currentSummary
    ? {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        name: `${currentSummary.label} Visualizer`,
        description: currentSummary.description,
        url: absoluteUrl(`/${currentSummary.id}`),
        inLanguage: 'en',
        educationalLevel: 'beginner to advanced',
        learningResourceType: 'Interactive visualization',
        teaches: currentSummary.label,
        about: {
          '@type': 'Thing',
          name: `${currentSummary.label} algorithm`,
        },
        provider: {
          '@type': 'Organization',
          name: SITE_NAME,
          sameAs: SITE_URL,
        },
        timeRequired: 'PT5M',
        isAccessibleForFree: true,
      }
    : null

  return (
    <>
      <StructuredData data={breadcrumbLd(breadcrumbs)} />
      <StructuredData data={itemListLd} />
      <StructuredData data={faqLd} />
      <StructuredData data={courseLd} />
      {learningResourceLd && <StructuredData data={learningResourceLd} />}

      <section
        aria-label="About AlgoVision"
        className="border-t border-[var(--border)]/40 bg-[var(--card)]/30 px-5 py-14 sm:px-10 sm:py-20"
      >
        <div className="mx-auto max-w-[1100px] space-y-12">
          {isAlgorithm && currentSummary ? (
            <header className="space-y-4">
              <nav aria-label="Breadcrumb" className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[var(--muted)]">
                <ol className="flex flex-wrap items-center gap-2">
                  <li>
                    <Link href={routePath('/')} className="hover:text-[var(--accent)]">AlgoVision</Link>
                  </li>
                  <li aria-hidden="true" className="opacity-40">/</li>
                  <li>{currentSummary.categoryLabel}</li>
                  <li aria-hidden="true" className="opacity-40">/</li>
                  <li className="text-[var(--ink)]">{currentSummary.label}</li>
                </ol>
              </nav>
              <h1 className="text-3xl font-black tracking-tighter sm:text-5xl">
                {currentSummary.label} Visualizer
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                {currentSummary.description} Step through each comparison and swap, watch the
                live code trace, and switch between TypeScript, Python, C++, and JavaScript
                implementations.
              </p>
              <dl className="flex flex-wrap gap-4 pt-2">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
                  <dt className="font-mono text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Time complexity</dt>
                  <dd className="mt-1 font-mono text-sm font-black">{currentSummary.timeComplexity}</dd>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
                  <dt className="font-mono text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Space complexity</dt>
                  <dd className="mt-1 font-mono text-sm font-black">{currentSummary.spaceComplexity}</dd>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
                  <dt className="font-mono text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Category</dt>
                  <dd className="mt-1 font-mono text-sm font-black">{currentSummary.categoryLabel}</dd>
                </div>
              </dl>
            </header>
          ) : (
            <header className="space-y-4">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[var(--accent)]">
                Free · No signup · Open source
              </p>
              <h1 className="text-3xl font-black tracking-tighter sm:text-5xl">
                Interactive Algorithm Visualizer
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                AlgoVision is a free, browser-based laboratory for visualizing classic computer
                science algorithms. Step through sorting, searching, graph traversal,
                pathfinding, and machine learning algorithms with synchronized animations and
                live code traces in TypeScript, Python, C++, and JavaScript.
              </p>
            </header>
          )}

          <section aria-label="Algorithm catalog" className="space-y-6">
            <h2 className="text-xl font-black tracking-tight sm:text-2xl">
              All algorithms covered
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Jump into any algorithm with one click. Each opens a step-by-step animation paired
              with the exact line of code currently executing.
            </p>
            <div className="space-y-8">
              {CATEGORIES.map(cat => (
                <div key={cat.id}>
                  <h3 className="mb-3 font-mono text-[11px] font-black uppercase tracking-[0.28em] text-[var(--accent)]">
                    {cat.label}
                  </h3>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(byCategory[cat.id] ?? []).map(a => (
                      <li key={a.id}>
                        <Link
                          href={routePath(`/${a.id}`)}
                          className="group block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5"
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-black tracking-tight text-[var(--ink)] group-hover:text-[var(--accent)]">
                              {a.label}
                            </span>
                            <span className="font-mono text-[10px] text-[var(--muted)]">
                              {a.timeComplexity}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                            {a.description}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section aria-label="Frequently asked questions" className="space-y-6">
            <h2 className="text-xl font-black tracking-tight sm:text-2xl">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {FAQ.map(item => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 open:border-[var(--accent)]/40"
                >
                  <summary className="cursor-pointer list-none font-bold tracking-tight">
                    <span className="mr-2 font-mono text-[var(--accent)]">›</span>
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          {isAlgorithm && currentSummary && (
            <section aria-label="Related algorithms" className="space-y-4">
              <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                Related {currentSummary.categoryLabel.toLowerCase()} algorithms
              </h2>
              <ul className="flex flex-wrap gap-2">
                {(byCategory[currentSummary.categoryId] ?? [])
                  .filter(a => a.id !== currentSummary.id)
                  .map(a => (
                    <li key={a.id}>
                      <Link
                        href={routePath(`/${a.id}`)}
                        className="inline-block rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-bold transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                      >
                        {a.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>
      </section>
    </>
  )
}
