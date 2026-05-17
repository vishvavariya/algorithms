/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AlgovisionApp from '../components/AlgovisionApp'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
    toString: () => '',
  }),
}))

// Mock audio
vi.mock('../utils/audio', () => ({
  getAlgorithmAudio: vi.fn().mockReturnValue({
    playPing: vi.fn(),
    playCompare: vi.fn(),
    playSwap: vi.fn(),
    setEnabled: vi.fn(),
  }),
}))

// Mock ShareButton
vi.mock('@/components/ShareButton', () => ({
  ShareButton: () => <div data-testid="share-button" />,
}))

describe('Algovision Feature Smoke Test', () => {
  it('renders the Algovision App and the default visualizer', async () => {
    render(<AlgovisionApp />)

    // Check header
    expect(screen.getByText(/algovision\./i)).toBeInTheDocument()
    
    // Check initial algorithm title (Bubble Sort is default)
    const titles = screen.getAllByText(/Bubble Sort/i)
    expect(titles.length).toBeGreaterThan(0)
    
    // Check battle mode toggle
    expect(screen.getByText(/Battle/i)).toBeInTheDocument()
  })
})
