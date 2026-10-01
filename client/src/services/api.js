const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function api(path, options = {}) {
  const token = localStorage.getItem('foodbridge-token')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The server took too long to respond. Check its MongoDB Atlas connection and try again.')
    }
    throw new Error('Could not reach FoodBridge. Check that the API server is running.')
  } finally {
    clearTimeout(timeout)
  }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || 'The request could not be completed')
  return payload
}