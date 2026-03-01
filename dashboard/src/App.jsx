import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Share from './pages/Share.jsx'
import AuthGuard from './components/AuthGuard.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login"          element={<Login />} />
      <Route path="/share/:token"   element={<Share />} />
      <Route path="/dashboard"      element={<AuthGuard><Dashboard /></AuthGuard>} />
      <Route path="/"               element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
