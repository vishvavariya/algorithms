import { Suspense } from 'react'
import { Metadata } from 'next'
import AlgovisionApp from './components/AlgovisionApp'
import { SeoContent } from './components/SeoContent'
import { createPageMetadata } from '@/lib/seo'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = createPageMetadata('algovision')

export default function AlgovisionPage() {
  return (
    <>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'AlgoVision — Interactive Algorithm Laboratory',
          description: 'Explore and debug sorting, searching, graph, and machine learning algorithms through high-fidelity interactive visualizations.',
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Any',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }}
      />
      <Suspense fallback={<AlgovisionFallback />}>
        <AlgovisionApp />
      </Suspense>
      <SeoContent slug="home" />
    </>
  )
}

function AlgovisionFallback() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#0a0a0a] px-4 text-center text-white">
      <div>
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-white/40">algovision lab</p>
        <h1 className="mt-3 text-2xl font-black lowercase tracking-tighter">loading algovision.</h1>
      </div>
    </main>
  )
}
