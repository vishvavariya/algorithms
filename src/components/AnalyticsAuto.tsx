'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import * as gtag from '@/lib/gtag'

function AnalyticsAutoInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      gtag.pageview(url)
    }
  }, [pathname, searchParams])

  return null
}

/**
 * Automatically tracks page views on route changes.
 * Must be wrapped in Suspense because it uses useSearchParams.
 */
export function AnalyticsAuto() {
  return (
    <Suspense fallback={null}>
      <AnalyticsAutoInner />
    </Suspense>
  )
}
