'use client'

import React from 'react'
import { Language } from '../types'

interface CodePanelProps {
  code: string
  activeLine: number
  language: Language
  onLanguageChange: (lang: Language) => void
  title?: string
  subtitle?: string
}

const LANGUAGE_LABELS: Record<Language, string> = {
  typescript: 'TS',
  python: 'PY',
  javascript: 'JS',
  cpp: 'C++',
}

export function CodePanel({ code, activeLine, language, onLanguageChange, title = 'code trace', subtitle = 'The glowing row is what the animation is doing now.' }: CodePanelProps) {
  const lines = code.split('\n')
  const languages: Language[] = ['typescript', 'python', 'javascript', 'cpp']

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-[2rem] border border-[var(--border)]/50 bg-[var(--card)]/80 text-[var(--ink)] shadow-[var(--shadow-premium)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">{title}</p>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]/60">{subtitle}</p>
        </div>
        <div className="flex gap-1.5 overflow-x-auto rounded-full border border-black/5 bg-black/[0.04] p-1 dark:border-white/10 dark:bg-white/[0.04]" role="tablist" aria-label="Code language">
          {languages.map((lang) => (
            <button
              type="button"
              key={lang}
              onClick={() => onLanguageChange(lang)}
              role="tab"
              aria-selected={language === lang}
              className={`min-h-9 min-w-10 rounded-full px-3 text-[10px] font-black uppercase tracking-wider transition-all ${
                language === lang
                  ? 'bg-[var(--accent)] text-white shadow-[0_0_24px_rgba(34,211,238,0.24)] dark:text-black'
                  : 'text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--ink)]'
              }`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[var(--card)] to-transparent" />
        <pre aria-label={`${language} implementation`} className="min-w-max pb-4">
          <code>
            {lines.map((line, index) => {
              const lineNumber = index + 1
              const isActive = activeLine === lineNumber

              return (
                <span
                  key={lineNumber}
                  className={`relative block rounded-xl px-4 py-0.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm'
                      : 'text-[var(--ink)]/70'
                  }`}
                >
                  {isActive && (
                    <>
                      <span className="absolute inset-y-1 left-0 w-1 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.4)] dark:bg-cyan-300 dark:shadow-[0_0_18px_rgba(34,211,238,0.6)]" />
                      <span className="absolute inset-y-0 right-0 w-16 rounded-r-xl bg-gradient-to-l from-[var(--accent)]/10 to-transparent dark:from-cyan-300/10" />
                    </>
                  )}
                  <span className={`inline-block w-8 select-none pr-3 text-right ${isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]/40'}`}>{lineNumber}</span>
                  <span>{line || ' '}</span>
                </span>
              )
            })}
          </code>
        </pre>
      </div>
    </div>
  )
}
