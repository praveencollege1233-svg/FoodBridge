import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, HandHeart, Leaf, Store, Truck } from 'lucide-react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const roles = [
  { value: 'donor', label: 'Restaurant', detail: 'Share food', icon: Store },
  { value: 'ngo', label: 'NGO', detail: 'Find food', icon: HandHeart },
  { value: 'volunteer', label: 'Volunteer', detail: 'Deliver', icon: Truck },
]

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [role, setRole] = useState('donor')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', organizationName: '', address: '' })
  if (user) return <Navigate to="/dashboard" replace />

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isRegister) await signUp({ ...form, role })
      else await signIn({ email: form.email, password: form.password })
      navigate(searchParams.get('next') || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'mt-1.5 w-full rounded-lg border border-[#dfe5dc] bg-white px-3.5 py-3 text-sm text-[#24352a] outline-none transition placeholder:text-[#a4ada5] focus:border-[#689372] focus:ring-2 focus:ring-[#dcebdc]'
  return (
    <main className="grid min-h-[calc(100vh-73px)] bg-[#f2f5ef] md:grid-cols-[.92fr_1.08fr]">
      <aside className="relative hidden min-h-[620px] overflow-hidden bg-[#214b34] text-white md:flex md:flex-col md:justify-between">
        <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85" alt="Fresh food ready to be shared with the community" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#163b28]/65 via-[#163b28]/20 to-[#163b28]/85" />
        <div className="relative flex items-center gap-2.5 px-9 pt-9 lg:px-12 lg:pt-12"><span className="grid size-9 place-items-center rounded-lg border border-white/30 bg-white/10"><Leaf size={18} /></span><span className="display-font text-base font-extrabold">foodbridge</span></div>
        <div className="relative px-9 pb-10 lg:px-12 lg:pb-14">
          <p className="text-xs font-bold tracking-[1.5px] text-[#d3e1d2]">GOOD FOOD, SHARED WELL</p>
          <h1 className="display-font mt-4 max-w-[480px] text-[38px] font-bold leading-[1.12] tracking-[-1px] lg:text-[46px]">A little surplus can go a long way.</h1>
          <p className="mt-4 max-w-[390px] text-[15px] leading-7 text-white/85">Restaurants, local organizations, and volunteers working together so good food reaches good people.</p>
          <div className="mt-8 flex items-center gap-3 border-t border-white/25 pt-5 text-xs font-semibold text-white/85"><span className="grid size-8 place-items-center rounded-full bg-white/15"><HandHeart size={15} /></span>Local food. Real neighbors. Less waste.</div>
        </div>
      </aside>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[440px]">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#657368] no-underline hover:text-[#285c3a]"><ArrowLeft size={15} /> Back to home</Link>
          <div className="mb-6 flex items-center gap-3 md:hidden"><span className="grid size-9 place-items-center rounded-lg bg-[#e1eee2] text-[#356844]"><Leaf size={19} /></span><span className="display-font text-base font-extrabold text-[#234b35]">foodbridge</span></div>
          <p className="text-xs font-bold uppercase tracking-[1.4px] text-[#68846c]">{isRegister ? 'Your place in the food loop' : 'Your community is waiting'}</p>
          <h2 className="display-font mt-2 text-[30px] font-bold tracking-[-.8px] text-[#26392c]">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
          <p className="mt-2 text-sm leading-6 text-[#78857b]">{isRegister ? 'Choose how you’d like to help good food find its next stop.' : 'Sign in to continue to your FoodBridge workspace.'}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {isRegister && <>
              <fieldset>
                <legend className="mb-2 text-xs font-bold text-[#526257]">I’m joining as</legend>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map(({ value, label, detail, icon: Icon }) => <label key={value} className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition focus-within:ring-2 focus-within:ring-[#dcebdc] ${role === value ? 'border-[#7ea487] bg-[#edf4eb] text-[#315e3b]' : 'border-[#dfe5dc] bg-white text-[#768379] hover:border-[#b7cbb8]'}`}>
                    <input className="sr-only" type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} />
                    <Icon size={18} />
                    <span className="text-xs font-bold">{label}</span>
                    <span className="text-[10px] text-[#849087]">{detail}</span>
                  </label>)}
                </div>
              </fieldset>
              <label className="block text-xs font-bold text-[#526257]">Your name<input required minLength="2" placeholder="Full name" className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" /></label>
              {role !== 'volunteer' && <label className="block text-xs font-bold text-[#526257]">Organization name<input required className={inputClass} value={form.organizationName} onChange={(event) => setForm({ ...form, organizationName: event.target.value })} /></label>}
              <div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-bold text-[#526257]">Phone<input className={inputClass} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} autoComplete="tel" /></label><label className="block text-xs font-bold text-[#526257]">Pickup area<input className={inputClass} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} autoComplete="street-address" /></label></div>
            </>}
            <label className="block text-xs font-bold text-[#526257]">Email address<input required type="email" placeholder="you@example.com" className={inputClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" /></label>
            <label className="block text-xs font-bold text-[#526257]">Password<div className="relative"><input required minLength="8" type={showPassword ? 'text' : 'password'} placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'} className={`${inputClass} pr-12`} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete={isRegister ? 'new-password' : 'current-password'} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-2 grid size-9 place-items-center rounded-md text-[#78857b] hover:bg-[#f0f4ee] hover:text-[#315e3b]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {error && <p role="alert" className="rounded-lg border border-[#edcfca] bg-[#fff4f1] px-3 py-2.5 text-sm text-[#a44034]">{error}</p>}
            <button disabled={saving} className="mt-2 w-full rounded-lg bg-[#24573a] px-4 py-3 text-sm font-bold text-white shadow-[0_6px_14px_rgba(36,87,58,.12)] transition hover:bg-[#19462d] disabled:cursor-wait disabled:opacity-60">{saving ? 'Please wait...' : isRegister ? 'Create account' : 'Log in'}</button>
          </form>
          <p className="mt-5 text-center text-sm text-[#78857b]">{isRegister ? 'Already have an account?' : 'New to FoodBridge?'} <Link className="font-bold text-[#326846] no-underline hover:underline" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></p>
        </div>
      </section>
    </main>
  )
}