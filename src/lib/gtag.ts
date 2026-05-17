// GA4 helpers. Docs: https://developers.google.com/analytics/devguides/collection/ga4

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

type GtagFn = (...args: unknown[]) => void
type EventParams = Record<string, unknown>

let lastPageViewKey: string | null = null
let lastPageViewAt = 0
let previousPageLocation: string | null = null

function getGtag(): GtagFn | null {
  if (typeof window === 'undefined') return null
  const win = window as unknown as { gtag?: GtagFn; dataLayer?: unknown[] }
  
  if (typeof win.gtag === 'function') return win.gtag
  
  // Fallback: define it if it's missing to queue events until gtag.js loads
  win.dataLayer = win.dataLayer || []
  win.gtag = function () {
    win.dataLayer!.push(arguments)
  }
  return win.gtag
}

function shouldSend(): boolean {
  return !!GA_TRACKING_ID && typeof window !== 'undefined'
}

function cleanParams(params: EventParams): EventParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}

function currentPageParams(): EventParams {
  if (typeof window === 'undefined') return {}

  return {
    page_location: window.location.href,
    page_path: window.location.pathname + window.location.search,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
  }
}

function sendEvent(action: string, params: EventParams = {}) {
  const gtag = getGtag()
  if (!shouldSend() || !gtag) return
  
  gtag('event', action, cleanParams({
    send_to: GA_TRACKING_ID,
    ...currentPageParams(),
    ...params,
  }))
}

export const isDevEnv = process.env.NODE_ENV !== 'production'

// Manual page_view (config uses send_page_view:false). GA4 prefers page_location + page_title.
export const pageview = (url: string, title?: string) => {
  const gtag = getGtag()
  if (!shouldSend() || !gtag) return

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const pageLocation = origin + url
  const pageTitle = title ?? (typeof document !== 'undefined' ? document.title : undefined)
  const pageViewKey = `${pageLocation}|${pageTitle ?? ''}`
  const now = Date.now()

  // Prevent duplicate hits on rapid navigation or double-mounts
  if (lastPageViewKey === pageViewKey && now - lastPageViewAt < 1000) return

  gtag('event', 'page_view', cleanParams({
    send_to: GA_TRACKING_ID,
    page_location: pageLocation,
    page_path: url,
    page_title: pageTitle,
    page_referrer: previousPageLocation ?? (typeof document !== 'undefined' ? document.referrer : undefined),
  }))

  lastPageViewKey = pageViewKey
  lastPageViewAt = now
  previousPageLocation = pageLocation
}

// Legacy signature kept for backwards-compat with existing call sites.
export const event = ({
  action,
  category,
  label,
  value,
  params,
}: {
  action: string
  category?: string
  label?: string
  value?: number
  params?: Record<string, unknown>
}) => {
  sendEvent(action, {
    event_category: category,
    event_label: label,
    value,
    ...params,
  })
}

// Modern typed helper. Prefer for new call sites.
export const track = (action: string, params: EventParams = {}) => sendEvent(action, params)

// Consent Mode v2. Call after user grants/denies consent (e.g. from a banner).
export const grantConsent = () => {
  const gtag = getGtag()
  if (!gtag) return
  gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  })
}

export const denyConsent = () => {
  const gtag = getGtag()
  if (!gtag) return
  gtag('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  })
}
