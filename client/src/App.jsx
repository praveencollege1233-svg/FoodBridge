import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<main className="mx-auto max-w-3xl px-5 py-24 text-center"><h1 className="display-font text-3xl font-bold text-[#26392c]">Page not found</h1><a href="/" className="mt-4 inline-block text-sm font-bold text-[#356947]">Back to FoodBridge</a></main>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
