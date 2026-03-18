import { useEffect, useCallback, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import { useStorage } from './hooks/useStorage'
import { useAppBlocker } from './hooks/useAppBlocker'
import { isNfcScanActive } from './hooks/useNfc'
import KatzePlugin from './plugins/KatzePlugin'
import Setup from './pages/Setup'
import Home from './pages/Home'
import Settings from './pages/Settings'

function AppRoutes() {
  const storage = useStorage()
  const { setLockState } = useAppBlocker()
  const navigate = useNavigate()
  const location = useLocation()
  const storageRef = useRef(storage)
  storageRef.current = storage
  const nfcToggleInProgress = useRef(false)

  const handleNfcToggle = useCallback(async (uid: string) => {
    const s = storageRef.current
    if (!s.setupComplete) return

    const isRegistered = s.nfcCards.some((c) => c.uid === uid)
    if (!isRegistered) return

    nfcToggleInProgress.current = true
    const newState = !s.locked
    await s.saveLockState(newState)
    await setLockState(newState, s.whitelist, newState ? s.timerConfig : undefined)
    nfcToggleInProgress.current = false
  }, [setLockState])

  // Global NFC listener — works on any page, but only after setup
  useEffect(() => {
    if (!storageRef.current.setupComplete) return

    const listener = KatzePlugin.addListener('nfcTagDetected', async (event) => {
      // Skip global handler when a local scan (e.g. adding a card) is active
      if (isNfcScanActive()) return

      await handleNfcToggle(event.uid)

      if (location.pathname !== '/') {
        navigate('/', { replace: true })
      }
    })

    return () => {
      listener.then((l) => l.remove())
    }
  }, [storage.setupComplete, handleNfcToggle, navigate, location.pathname])

  // Check for pending NFC tag on mount (cold start)
  useEffect(() => {
    if (!storage.setupComplete) return

    const checkPending = async () => {
      const { uid } = await KatzePlugin.getPendingNfcTag()
      if (uid) {
        await handleNfcToggle(uid)
        if (location.pathname !== '/') {
          navigate('/', { replace: true })
        }
      }
    }
    checkPending()
  }, [storage.setupComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle hardware back button: navigate to home from sub-pages
  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (location.pathname !== '/') {
        navigate('/', { replace: true })
      }
    })
    return () => { listener.then((l) => l.remove()) }
  }, [location.pathname, navigate])

  // Sync lock state from native when app resumes (e.g. timer expired while closed)
  useEffect(() => {
    const listener = CapApp.addListener('appStateChange', async ({ isActive }) => {
      if (!isActive || !storageRef.current.setupComplete) return
      // Don't overwrite state if an NFC toggle just happened
      if (nfcToggleInProgress.current) return
      const { locked } = await KatzePlugin.getNativeLockState()
      if (locked !== storageRef.current.locked) {
        await storageRef.current.saveLockState(locked)
      }
    })
    return () => { listener.then((l) => l.remove()) }
  }, [])

  if (storage.setupComplete === null) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          storage.setupComplete ? (
            <Home storage={storage} />
          ) : (
            <Navigate to="/setup" replace />
          )
        }
      />
      <Route
        path="/setup"
        element={
          storage.setupComplete ? (
            <Navigate to="/" replace />
          ) : (
            <Setup storage={storage} />
          )
        }
      />
      <Route
        path="/settings"
        element={
          storage.setupComplete ? (
            <Settings storage={storage} />
          ) : (
            <Navigate to="/setup" replace />
          )
        }
      />
    </Routes>
  )
}

export default function App() {
  return <AppRoutes />
}
