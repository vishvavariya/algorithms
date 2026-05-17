'use client'

import { useEffect, useRef } from 'react'
import * as gtag from '@/lib/gtag'

/**
 * PresenceBeacon tracks session duration and engagement milestones.
 * It emits a 'heartbeat' every minute to help measure true time-on-page.
 */
export function PresenceBeacon() {
  const startTime = useRef(Date.now())
  const heartbeatCount = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      heartbeatCount.current += 1
      const duration = Math.round((Date.now() - startTime.current) / 1000)
      
      gtag.track('session_heartbeat', {
        event_category: 'engagement',
        event_label: window.location.pathname,
        value: heartbeatCount.current,
        duration_seconds: duration,
      })
    }, 60000) // Every minute

    return () => clearInterval(interval)
  }, [])

  return null
}
