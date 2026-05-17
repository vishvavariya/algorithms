'use client'

class AlgorithmAudio {
  private ctx: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioContextClass) {
        this.ctx = new AudioContextClass()
      }
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (enabled && this.ctx?.state === 'suspended') {
      this.ctx.resume()
    }
  }

  playCompare(freq: number, volume: number = 0.05) {
    this.playPing(freq, volume, 'compare')
  }

  playSwap(freq: number, volume: number = 0.08) {
    this.playPing(freq, volume, 'swap')
  }

  playPing(freq: number, volume: number = 0.1, type: 'compare' | 'swap' | 'success' | 'neutral' = 'compare') {
    if (!this.enabled || !this.ctx) return

    try {
      if (this.ctx.state === 'suspended') this.ctx.resume()
      
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.frequency.setValueAtTime(freq, this.ctx.currentTime)

      if (type === 'compare') {
        osc.type = 'sine'
        gain.gain.setValueAtTime(volume, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1)
      } else if (type === 'swap') {
        osc.type = 'triangle'
        gain.gain.setValueAtTime(volume, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15)
      } else if (type === 'success') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(freq * 2, this.ctx.currentTime + 0.2)
        gain.gain.setValueAtTime(volume, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3)
      } else {
        osc.type = 'sine'
        gain.gain.setValueAtTime(volume, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05)
      }

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + (type === 'success' ? 0.3 : 0.15))
    } catch (e) {
      console.warn('Audio play failed:', e)
    }
  }
}

let instance: AlgorithmAudio | null = null

export function getAlgorithmAudio() {
  if (typeof window === 'undefined') return null
  if (!instance) instance = new AlgorithmAudio()
  return instance
}
