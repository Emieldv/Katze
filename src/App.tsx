import { useEffect, useCallback, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useStorage } from './hooks/useStorage'
import { useAppBlocker } from './hooks/useAppBlocker'
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

  const handleNfcToggle = useCallback(async (uid: string) => {
    const s = storageRef.current
    if (!s.setupComplete) return

    const isRegistered = s.nfcCards.some((c) => c.uid === uid)
    if (!isRegistered) return

    const newState = !s.locked
    await s.saveLockState(newState)
    await setLockState(newState, s.whitelist)
  }, [setLockState])

  // Global NFC listener — works on any page, but only after setup
  useEffect(() => {
    if (!storageRef.current.setupComplete) return

    const listener = KatzePlugin.addListener('nfcTagDetected', async (event) => {
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
