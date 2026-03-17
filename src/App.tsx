import { Routes, Route, Navigate } from 'react-router-dom'
import { useStorage } from './hooks/useStorage'
import Setup from './pages/Setup'
import Home from './pages/Home'
import Settings from './pages/Settings'

export default function App() {
  const storage = useStorage()

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
