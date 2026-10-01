import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('foodbridge-token')))

  useEffect(() => {
    if (!localStorage.getItem('foodbridge-token')) return
    api('/auth/me')
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => localStorage.removeItem('foodbridge-token'))
      .finally(() => setLoading(false))
  }, [])

  async function signIn(credentials) {
    const result = await api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
    localStorage.setItem('foodbridge-token', result.token)
    setUser(result.user)
  }

  async function signUp(details) {
    const result = await api('/auth/register', { method: 'POST', body: JSON.stringify(details) })
    localStorage.setItem('foodbridge-token', result.token)
    setUser(result.user)
  }

  function signOut() {
    localStorage.removeItem('foodbridge-token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}