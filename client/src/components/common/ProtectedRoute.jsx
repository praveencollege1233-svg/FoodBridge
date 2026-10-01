import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid min-h-[60vh] place-items-center text-sm font-semibold text-[#637268]">Loading your workspace...</div>
  return user ? children : <Navigate to="/login" replace />
}