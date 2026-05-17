'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Star, User, Mail, MessageSquare, Coffee, ExternalLink } from './Icons'
import * as gtag from '../../lib/gtag'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Track feedback submission
    gtag.track('feedback_submit', {
      event_category: 'engagement',
      event_label: 'algovision_feedback',
      value: rating
    })

    try {
      // SUBMIT TO FIRESTORE
      await addDoc(collection(db, 'feedback'), {
        name,
        email,
        rating,
        message,
        createdAt: serverTimestamp(),
        source: 'algovision_v1'
      })
    } catch (error) {
      console.error('Feedback Firestore submission failed:', error)
      // Fallback for dev/missing config: log to console
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        console.warn('Firebase credentials missing. Check your .env.local')
      }
    }

    setIsSubmitting(false)
    setIsSubmitted(true)

    // If not a 5-star rating, close automatically after a delay
    if (rating < 5) {
      setTimeout(() => {
        onClose()
        setTimeout(() => {
          setIsSubmitted(false)
          setName('')
          setEmail('')
          setRating(0)
          setMessage('')
        }, 300)
      }, 2500)
    }
  }

  const handleCoffeeClick = () => {
    gtag.track('coffee_click', { event_category: 'engagement', event_label: 'feedback_modal' })
    window.open('https://ko-fi.com/vishvavariya', '_blank')
    onClose()
    setTimeout(() => {
      setIsSubmitted(false)
      setName('')
      setEmail('')
      setRating(0)
      setMessage('')
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-premium)] backdrop-blur-xl"
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              <X size={20} />
            </button>

            {isSubmitted ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${rating === 5 ? 'bg-amber-400/10 text-amber-500' : 'bg-[var(--accent)]/10 text-[var(--accent)]'}`}>
                  {rating === 5 ? <Coffee size={32} /> : <Send size={32} />}
                </div>
                <h2 className="mt-6 text-2xl font-black tracking-tight text-[var(--ink)]">
                  {rating === 5 ? 'You made my day!' : 'Thank you!'}
                </h2>
                <p className="mt-2 text-[var(--muted)]">
                  {rating === 5
                    ? "I'm thrilled you loved the visualizations. If you'd like to support my work, a coffee would be amazing!"
                    : "Your feedback helps me improve the laboratory."}
                </p>

                {rating === 5 && (
                  <button
                    onClick={handleCoffeeClick}
                    className="mt-8 flex items-center gap-2 rounded-2xl bg-amber-500 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
                  >
                    <Coffee size={18} />
                    Buy me a Coffee
                    <ExternalLink size={14} className="ml-1 opacity-60" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-black tracking-tight text-[var(--ink)]">Share your thoughts</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">How's your experience with the AlgoVision Sandbox?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                        <User size={12} /> Name
                      </label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Vishva Variya"
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--canvas-bg)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50 focus:outline-none focus:ring-0 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                        <Mail size={12} /> Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hello@vishva.lol"
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--canvas-bg)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50 focus:outline-none focus:ring-0 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`transition-all hover:scale-110 ${star <= rating ? 'text-amber-400' : 'text-[var(--border)] hover:text-[var(--muted)]'}`}
                        >
                          <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                      <MessageSquare size={12} /> Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="I love the visualizations! Maybe add..."
                      className="w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--canvas-bg)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50 focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>

                  <button
                    disabled={rating === 0 || isSubmitting}
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Send size={16} />
                    )}
                    {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
