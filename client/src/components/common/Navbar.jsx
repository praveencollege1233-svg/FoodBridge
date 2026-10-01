import { ArrowRight, Leaf, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, signOut } = useAuth()
  return (
    <header className="border-b border-[#e4e9df] bg-[#fbfcf8]/90">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 text-[#234b35] no-underline">
          <span className="grid size-9 place-items-center rounded-xl bg-[#e5f1e7]"><Leaf size={19} strokeWidth={2.4} /></span>
          <span className="display-font text-[17px] font-extrabold tracking-[-0.5px]">foodbridge</span>
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="hidden text-sm font-semibold text-[#46594d] no-underline sm:block">Workspace</Link>
              <span className="hidden rounded-full bg-[#edf2eb] px-3 py-1.5 text-xs font-bold capitalize text-[#46634e] md:inline-flex">{user.role}</span>
              <button onClick={signOut} title="Sign out" className="grid size-9 place-items-center rounded-lg border border-[#e1e7dd] bg-white text-[#536258] hover:bg-[#f1f4ef]"><LogOut size={16} /></button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-semibold text-[#46594d] no-underline">Log in</Link>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-[#24573a] px-4 py-2.5 text-sm font-bold text-white no-underline hover:bg-[#19462d]">Join FoodBridge <ArrowRight size={15} /></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}