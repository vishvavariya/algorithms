'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  query, 
  serverTimestamp,
  increment
} from 'firebase/firestore'

// Unique ID for this session to track "Active Now"
const SESSION_ID = Math.random().toString(36).substring(2, 15)

export function useUserStats() {
  const [activeUsers, setActiveUsers] = useState(1)
  const [totalVisits, setTotalVisits] = useState(0)

  useEffect(() => {
    // 1. TRACK ACTIVE SESSION WITH HEARTBEAT
    const sessionRef = doc(db, 'active_sessions', SESSION_ID)
    
    const markActive = async () => {
      try {
        await setDoc(sessionRef, {
          lastActive: serverTimestamp(),
          // Use a plain numeric timestamp for easier client-side filtering if needed
          activeAt: Date.now(),
          userAgent: navigator.userAgent
        }, { merge: true })
      } catch (e) {
        console.error('Presence error:', e)
      }
    }

    markActive()
    const heartbeat = setInterval(markActive, 30000) // Pulse every 30s

    // 2. INCREMENT TOTAL VISITS (Resilient atomic increment)
    const incrementTotal = async () => {
      const statsRef = doc(db, 'site_stats', 'counters')
      try {
        // setDoc with merge:true and increment(1) is the most robust way
        // It creates the doc if missing, and correctly handles the first hit
        await setDoc(statsRef, { 
          totalVisits: increment(1),
          lastHit: serverTimestamp()
        }, { merge: true })
      } catch (e) {
        console.error('Stats error:', e)
      }
    }

    // Check session storage to avoid double-counting on refresh
    if (!sessionStorage.getItem('visit_counted')) {
      incrementTotal()
      sessionStorage.setItem('visit_counted', 'true')
    }

    // 3. LISTEN TO ACTIVE USERS (Filter out sessions older than 2 minutes)
    // Note: Since we use heartbeat, real users will stay within this window
    const activeQuery = query(collection(db, 'active_sessions'))
    const unsubscribeActive = onSnapshot(activeQuery, 
      (snap) => {
        const now = Date.now()
        const twoMinutesAgo = now - 120000
        
        // Filter stale sessions that didn't clean up properly
        const liveCount = snap.docs.filter(doc => {
          const data = doc.data()
          const lastSeen = data.activeAt || 0
          return lastSeen > twoMinutesAgo
        }).length

        setActiveUsers(Math.max(1, liveCount))
      },
      (error) => {
        if (error.code === 'permission-denied') {
          console.warn('Presence listen denied. Check Firestore rules.')
        } else {
          console.error('Active users listen error:', error)
        }
      }
    )

    // 4. LISTEN TO TOTAL VISITS
    const statsRef = doc(db, 'site_stats', 'counters')
    const unsubscribeTotal = onSnapshot(statsRef, 
      (snap) => {
        if (snap.exists()) {
          setTotalVisits(snap.data().totalVisits || 0)
        }
      },
      (error) => {
        if (error.code === 'permission-denied') {
          console.warn('Stats listen denied. Check Firestore rules.')
        } else {
          console.error('Total visits listen error:', error)
        }
      }
    )

    // CLEANUP
    const handleUnload = () => {
      // Best effort to remove session on exit
      deleteDoc(sessionRef)
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      clearInterval(heartbeat)
      window.removeEventListener('beforeunload', handleUnload)
      deleteDoc(sessionRef).catch(() => {}) // Ignore errors on cleanup
      unsubscribeActive()
      unsubscribeTotal()
    }
  }, [])

  return { activeUsers, totalVisits }
}
