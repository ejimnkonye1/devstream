import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

export default function AuthGuard({ children }) {
  const user = useAuth()

  // Still checking auth state
  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}
