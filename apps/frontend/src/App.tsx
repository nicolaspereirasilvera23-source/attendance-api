import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CheckInPage } from './pages/CheckInPage'
import { DashboardPage } from './pages/DashboardPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/check-in" element={<CheckInPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Redirige raiz al portal de check-in como pantalla principal */}
        <Route path="*" element={<Navigate to="/check-in" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
