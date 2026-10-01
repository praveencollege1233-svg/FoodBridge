import { ArrowDownRight, ArrowRight, Boxes, HandHeart, HeartHandshake, Leaf, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const roles = [
  { icon: Boxes, title: 'Restaurants', copy: 'Post surplus food, set a pickup location, and share what can still be used in time.' },
  { icon: HandHeart, title: 'Community groups', copy: 'Browse nearby listings, request exactly what your organization needs, and track the status.' },
  { icon: Truck, title: 'Volunteers', copy: 'Accept delivery jobs, collect food, and help it reach the people waiting for it.' },
]

const processSteps = [
  'Restaurant or donor posts surplus food with the quantity, pickup location, and deadline.',
  'A verified community group reviews nearby listings and requests the amount it can distribute.',
  'The donor approves or rejects the request, reserving the food and creating a volunteer delivery task.',
  'A volunteer claims the job, picks up the food, and marks the donation as collected.',
  'The destination group confirms receipt, closing the loop and showing the food reached the right people.',
]

const currentYear = new Date().getFullYear()

export default function Home() {
  const { user } = useAuth()
  return (
    <main className="overflow-hidden">
      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 pb-16 pt-12 md:grid-cols-[0.94fr_1.06fr] md:gap-12 md:pb-24 md:pt-16 lg:px-8">
        <div className="rise-in relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dce8dc] bg-white px-3 py-1.5 text-xs font-bold text-[#3d704b]"><Leaf size={14} /> LESS WASTE, MORE NOURISHMENT</div>
          <h1 className="display-font max-w-[590px] text-[42px] font-extrabold leading-[1.08] tracking-[-1.8px] text-[#1a3024] sm:text-[56px]">Good food deserves a <span className="text-[#4f8759]">good next stop.</span></h1>
          <p className="mt-5 max-w-[500px] text-[16px] leading-7 text-[#64736a]">FoodBridge brings restaurants, local organizations, and volunteers together to get surplus food where it can make a difference.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={user ? '/dashboard' : '/register'} className="inline-flex items-center gap-2 rounded-lg bg-[#24573a] px-5 py-3 text-sm font-bold text-white no-underline shadow-[0_8px_18px_rgba(36,87,58,.16)] hover:bg-[#19462d]">{user ? 'Open workspace' : 'Get started'} <ArrowRight size={16} /></Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 px-3 py-3 text-sm font-bold text-[#53665a] no-underline">How it works <ArrowDownRight size={15} /></a>
          </div>
          <div className="mt-10 flex items-center gap-4 border-t border-[#e3e9df] pt-5">
            <span className="grid size-10 place-items-center rounded-full bg-[#e7f0e5] text-[#467b4e]"><HeartHandshake size={19} /></span>
            <p className="text-sm leading-5 text-[#738078]">A local food loop, built on trust.<br /><strong className="text-[#3f5747]">Every pickup makes an impact.</strong></p>
          </div>
        </div>
        <div className="rise-in rise-in-delay relative min-h-[350px] overflow-hidden rounded-[4px] bg-[#dce9d9] sm:min-h-[450px]">
          <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85" alt="Fresh vegetables ready to be shared" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#183321]/65 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-3 text-white sm:bottom-8 sm:left-8 sm:right-8">
            <div><p className="text-xs font-bold tracking-[1.4px] text-white/75">A BETTER KIND OF LEFTOVER</p><p className="display-font mt-1 text-[23px] font-bold leading-tight sm:text-[28px]">From kitchens to neighbors.</p></div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/40 bg-white/15 backdrop-blur"><Leaf size={19} /></span>
          </div>
          <div className="soft-grid absolute right-0 top-0 -z-10 h-28 w-28" />
        </div>
      </section>
      <section id="how-it-works" className="border-y border-[#e4e9df] bg-[#eff3eb]">
        <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8 lg:py-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[1.5px] text-[#68846c]">ONE SHARED TABLE</p><h2 className="display-font mt-2 text-[27px] font-bold tracking-[-.6px] text-[#263d2d]">Three roles. One simple loop.</h2></div><span className="text-sm text-[#748077]">The right food, to the right place, on time.</span></div>
          <div className="grid gap-3 md:grid-cols-3">{roles.map(({ icon: Icon, title, copy }, index) => <article key={title} className="flex gap-4 border-t-2 border-[#a7c0a7] bg-[#f8faf5] p-5"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#e7f0e5] text-[#4c7953]"><Icon size={19} /></span><div><span className="text-[11px] font-bold text-[#8a9b8b]">0{index + 1}</span><h3 className="display-font mt-1 text-base font-bold text-[#31483a]">{title}</h3><p className="mt-1 text-sm leading-5 text-[#738078]">{copy}</p></div></article>)}</div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[18px] border border-[#d9e2d6] bg-[#f7faf5] p-6 shadow-[0_10px_25px_rgba(45,74,56,0.04)]">
              <p className="text-xs font-bold tracking-[1.5px] text-[#6b866a]">HOW THE LOOP WORKS</p>
              <h3 className="display-font mt-2 text-[28px] font-bold tracking-[-0.6px] text-[#1f392c]">From a surplus listing to a confirmed handoff.</h3>
              <p className="mt-3 max-w-[620px] text-[16px] leading-7 text-[#64736a]">FoodBridge helps people move food before it goes to waste. Every step is designed to reduce delays, keep the process transparent, and make it easier for everyone involved to follow what happens next.</p>
            </div>

            <div className="rounded-[18px] border border-[#d9e2d6] bg-white/60 p-5 shadow-[0_10px_25px_rgba(45,74,56,0.04)]">
              <p className="text-xs font-bold tracking-[1.5px] text-[#6b866a]">FULL PROCESS</p>
              <ol className="mt-4 space-y-3">
                {processSteps.map((step, index) => (
                  <li key={step} className="flex gap-3 rounded-xl border border-[#edf1eb] bg-[#f9fbf8] p-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e7f0e5] text-[11px] font-bold text-[#325d3d]">{index + 1}</span>
                    <span className="text-sm leading-6 text-[#4d5a51]">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
      <footer className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-3 px-5 py-6 text-xs text-[#839087] lg:px-8"><span>© {currentYear} FoodBridge</span><span>Good food, shared well.</span></footer>
    </main>
  )
}