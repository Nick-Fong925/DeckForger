import { type ReactElement } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import RootLayout from './layouts/RootLayout'
import LoginPage from './pages/LoginPage'
import UploadPage from './pages/UploadPage'
import DecksPage from './pages/DecksPage'
import DeckDetailPage from './pages/DeckDetailPage'
import CreateDeckPage from './pages/CreateDeckPage'
import StudyPage from './pages/StudyPage'

export default function App(): ReactElement {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<RootLayout />}>
            <Route index element={<Navigate to="/decks" replace />} />
            <Route path="/dashboard" element={<Navigate to="/decks" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/decks" element={<DecksPage />} />
            <Route path="/decks/new" element={<CreateDeckPage />} />
            <Route path="/decks/:id" element={<DeckDetailPage />} />
            <Route path="/decks/:id/study" element={<StudyPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}
