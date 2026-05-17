'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as gtag from '../lib/gtag'

type ShareButtonProps = {
  text: string
  url?: string
  title?: string
  eventName: string
  eventParams?: Record<string, unknown>
  className?: string
  children?: React.ReactNode
  ariaLabel?: string
}

type ShareState = 'idle' | 'copied' | 'shared'

function canUseNativeShare() {
  if (typeof navigator === 'undefined') return false
  return typeof navigator.share === 'function'
}

export function ShareButton({
  text,
  url,
  title,
  eventName,
  eventParams,
  className,
  children,
  ariaLabel,
}: ShareButtonProps) {
  const [state, setState] = useState<ShareState>('idle')
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (resetRef.current) clearTimeout(resetRef.current)
  }, [])

  const handleClick = useCallback(async () => {
    const resolvedUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '')
    const resolvedTitle = title ?? (typeof document !== 'undefined' ? document.title : '')

    const fireEvent = (method: 'native' | 'clipboard' | 'fallback') => {
      gtag.track(eventName, {
        event_category: 'engagement',
        event_label: method,
        share_method: method,
        ...eventParams,
      })
    }

    if (canUseNativeShare()) {
      try {
        await navigator.share({ title: resolvedTitle, text, url: resolvedUrl })
        setState('shared')
        fireEvent('native')
      } catch (err) {
        // User cancelled or browser blocked — silent.
        if ((err as DOMException)?.name === 'AbortError') return
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(`${text} ${resolvedUrl}`.trim())
        setState('copied')
        fireEvent('clipboard')
      } catch {
        fireEvent('fallback')
      }
    } else {
      fireEvent('fallback')
    }

    if (resetRef.current) clearTimeout(resetRef.current)
    resetRef.current = setTimeout(() => setState('idle'), 1800)
  }, [text, url, title, eventName, eventParams])

  const label =
    state === 'copied' ? 'Link copied' : state === 'shared' ? 'Shared' : (children ?? 'Share')

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel ?? (typeof label === 'string' ? label : 'Share')}
      data-share-state={state}
      className={className}
    >
      {label}
    </button>
  )
}
