import { type ReactElement } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import DecksPage from './pages/DecksPage'
import StudyPage from './pages/StudyPage'

export default function App(): ReactElement {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RootLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/decks" element={<DecksPage />} />
        <Route path="/decks/:id/study" element={<StudyPage />} />
      </Route>
    </Routes>
  )
}
