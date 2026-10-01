import { useEffect, useState } from 'react'
import { ArrowDownToLine, ArrowUpRight, Check, CircleAlert, ClipboardList, Leaf, Plus, RefreshCw, ShieldCheck, Truck, Utensils, X } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'

const roleNames = { donor: 'Food donor', ngo: 'Community organization', volunteer: 'Delivery volunteer', admin: 'Platform admin' }
const tabsByRole = {
  donor: [['overview', 'Overview'], ['donations', 'My food'], ['requests', 'Requests']],
  ngo: [['overview', 'Find food'], ['requests', 'My requests']],
  volunteer: [['overview', 'Available'], ['deliveries', 'My deliveries']],
  admin: [['overview', 'Overview'], ['verification', 'Organizations']],
}
const formatDate = (value) => new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
const minimumPickupDate = new Date().toISOString().slice(0, 16)

function Status({ value }) {
  const styles = { available: 'bg-[#e5f1e6] text-[#39704a]', pending: 'bg-[#fff1d8] text-[#94671b]', approved: 'bg-[#e5f1e6] text-[#39704a]', rejected: 'bg-[#fbe9e6] text-[#a84d40]', assigned: 'bg-[#e9eff9] text-[#48648b]', picked_up: 'bg-[#e9eff9] text-[#48648b]', delivered: 'bg-[#e5f1e6] text-[#39704a]', confirmed: 'bg-[#e5f1e6] text-[#39704a]', reserved: 'bg-[#fff1d8] text-[#94671b]', completed: 'bg-[#edf0eb] text-[#657267]', cancelled: 'bg-[#f2e9e7] text-[#85645e]', verified: 'bg-[#e5f1e6] text-[#39704a]' }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${styles[value] || 'bg-[#edf0eb] text-[#657267]'}`}>{value?.replace('_', ' ')}</span>
}

function Empty({ title, copy }) {
  return <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-[#dce4d9] bg-white px-6 text-center"><div><span className="mx-auto grid size-10 place-items-center rounded-full bg-[#edf3ea] text-[#66816a]"><Leaf size={18} /></span><h3 className="display-font mt-3 text-sm font-bold text-[#3c5042]">{title}</h3><p className="mt-1 text-sm text-[#829086]">{copy}</p></div></div>
}

function ActionButton({ children, onClick, tone = 'green', disabled = false, type = 'button' }) {
  const tones = { green: 'bg-[#24573a] text-white hover:bg-[#19462d]', light: 'border border-[#dfe6dc] bg-white text-[#526358] hover:bg-[#f2f5f0]', red: 'border border-[#f0d8d3] bg-white text-[#a24c41] hover:bg-[#fff5f3]' }
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${tones[tone]}`}>{children}</button>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [revision, setRevision] = useState(0)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [requestQuantity, setRequestQuantity] = useState('1')
  const [data, setData] = useState({ donations: [], requests: [], deliveries: [], pendingOrganizations: [], stats: {} })
  const [form, setForm] = useState({ title: '', description: '', category: 'prepared', quantity: '10', unit: 'meals', pickupAddress: user.address || '', pickupBy: '' })

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const result = { donations: [], requests: [], deliveries: [], pendingOrganizations: [], stats: {} }
        if (user.role === 'donor') {
          const [donations, requests] = await Promise.all([api('/donations/mine'), api('/requests/managed')])
          result.donations = donations.donations
          result.requests = requests.requests
        } else if (user.role === 'ngo') {
          const [donations, requests] = await Promise.all([api('/donations'), api('/requests/mine')])
          result.donations = donations.donations
          result.requests = requests.requests
        } else if (user.role === 'volunteer') {
          const [available, mine] = await Promise.all([api('/deliveries/available'), api('/deliveries/mine')])
          result.available = available.deliveries
          result.deliveries = mine.deliveries
        } else {
          const overview = await api('/admin/overview')
          result.stats = overview.stats
          result.pendingOrganizations = overview.pendingOrganizations
        }
        if (active) { setData(result); setError('') }
      } catch (loadError) {
        if (active) setError(loadError.message)
      }
    }
    load()
    return () => { active = false }
  }, [user, revision])

  async function run(action, successMessage) {
    setBusy(true); setError(''); setNotice('')
    try {
      await action()
      setNotice(successMessage)
      setRevision((value) => value + 1)
    } catch (actionError) { setError(actionError.message) }
    finally { setBusy(false) }
  }

  async function publish(event) {
    event.preventDefault()
    if (user.verificationStatus !== 'verified') {
      setError('Admin verification is required before you can publish food.')
      return
    }
    if (!form.pickupBy) {
      setError('Add a pickup deadline so community groups know when the food needs to move.')
      return
    }
    await run(() => api('/donations', { method: 'POST', body: JSON.stringify({ ...form, quantity: Number(form.quantity), pickupBy: new Date(form.pickupBy).toISOString() }) }), 'Your food is now listed for nearby organizations.')
    setForm({ ...form, title: '', description: '', quantity: '10', unit: 'meals', pickupAddress: user.address || '', pickupBy: '' })
    setTab('donations')
  }

  async function requestFood(donation) {
    const quantity = Number(requestQuantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > donation.quantity) {
      setError(`Enter a quantity from 1 to ${donation.quantity} ${donation.unit}.`)
      return
    }
    await run(() => api(`/requests/donations/${donation._id}`, { method: 'POST', body: JSON.stringify({ quantity }) }), 'Request sent to the food donor.')
  }

  const tabs = tabsByRole[user.role] || tabsByRole.donor
  const visibleTab = tabs.some(([key]) => key === tab) ? tab : tabs[0][0]
  const requestsWaiting = data.requests.filter((request) => request.status === 'pending').length
  const cards = user.role === 'donor'
    ? [['Published food', data.donations.length, Utensils], ['Waiting for review', requestsWaiting, ClipboardList], ['Completed pickups', data.donations.filter((item) => item.status === 'completed').length, Truck]]
    : user.role === 'ngo'
      ? [['Food available', data.donations.length, Utensils], ['Requests sent', data.requests.length, ClipboardList], ['Approved', data.requests.filter((item) => ['approved', 'delivered'].includes(item.status)).length, Check]]
      : user.role === 'volunteer'
        ? [['Ready to deliver', (data.available || []).length, Truck], ['My deliveries', data.deliveries.length, ClipboardList], ['Completed', data.deliveries.filter((item) => ['delivered', 'confirmed'].includes(item.status)).length, Check]]
        : [['People', data.stats.users || 0, ShieldCheck], ['Food listings', data.stats.donations || 0, Utensils], ['Deliveries', data.stats.deliveries || 0, Truck]]

  return (
    <main className="dashboard-page mx-auto max-w-[1240px] px-5 py-7 lg:px-8 lg:py-10">
      {user.role === 'ngo' && data.requests.some((request) => request.delivery?.status === 'delivered') && <section className="mb-6 rounded-xl border border-[#d9e7d7] bg-[#edf5ea] p-5"><h2 className="display-font text-sm font-bold text-[#36563d]">Delivery received?</h2><div className="mt-3 flex flex-wrap gap-3">{data.requests.filter((request) => request.delivery?.status === 'delivered').map((request) => <div key={request._id} className="flex flex-wrap items-center gap-3 rounded-lg border border-[#dce8d9] bg-white px-3 py-2"><span className="text-sm font-semibold text-[#526358]">{request.donation?.title || 'Food delivery'}</span><ActionButton disabled={busy} onClick={() => run(() => api(`/requests/deliveries/${request.delivery._id}/confirm`, { method: 'PATCH' }), 'Receipt confirmed. Thank you for closing the loop.')}><Check size={14} /> Confirm receipt</ActionButton></div>)}</div></section>}
      <div className="dashboard-heading rise-in mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[1.35px] text-[#7c9180]">{roleNames[user.role]} workspace</p><h1 className="display-font mt-1.5 text-[27px] font-extrabold tracking-[-.8px] text-[#26392c]">Good day, {user.name.split(' ')[0]}</h1><p className="mt-1 text-sm text-[#7e8a80]">{user.role === 'ngo' ? 'Find fresh food and keep track of your requests.' : user.role === 'volunteer' ? 'Your next pickup is one small trip away.' : user.role === 'admin' ? 'A clear view of what is moving across the platform.' : 'Make the most of the food your kitchen has prepared.'}</p></div>
        <button onClick={() => setRevision((value) => value + 1)} title="Refresh workspace" className="grid size-9 place-items-center rounded-lg border border-[#dfe5dc] bg-white text-[#637269] hover:bg-[#f1f4ef]"><RefreshCw size={15} /></button>
      </div>

      {['donor', 'ngo'].includes(user.role) && user.verificationStatus !== 'verified' && <div className="mb-6 rounded-lg border border-[#eadcb9] bg-[#fff8e9] px-4 py-3 text-sm text-[#806321]">{user.verificationStatus === 'rejected' ? 'Your organization verification was declined. Contact platform support for help.' : 'Your organization is awaiting admin verification. You can explore the workspace, but food actions unlock after approval.'}</div>}

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[#dfe5dc]">{tabs.map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition ${visibleTab === key ? 'border-[#438052] text-[#356947]' : 'border-transparent text-[#859087] hover:text-[#516258]'}`}>{label}</button>)}</div>
      {error && <div role="alert" className="mb-5 flex items-center gap-2 rounded-lg border border-[#eed6d1] bg-[#fff5f3] px-4 py-3 text-sm text-[#a44e42]"><CircleAlert size={16} />{error}</div>}
      {notice && <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#d8e9d8] bg-[#f1f8f0] px-4 py-3 text-sm text-[#3d704a]"><Check size={16} />{notice}</div>}

      {user.role === 'ngo' && visibleTab === 'overview' && <label className="mb-4 inline-flex items-center gap-3 text-xs font-bold text-[#68776c]">Quantity to request<input aria-label="Quantity to request" type="number" min="1" value={requestQuantity} onChange={(event) => setRequestQuantity(event.target.value)} className="w-24 rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm font-normal" /></label>}

      {user.role === 'donor' && visibleTab === 'overview' && <div className={`rise-in donor-overview dashboard-stagger ${user.verificationStatus !== 'verified' ? 'is-pending' : ''} grid gap-6 lg:grid-cols-[1.1fr_.9fr]`}>
        <section className="rounded-xl border border-[#e1e7dd] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="display-font text-base font-bold text-[#33483a]">Share surplus food</h2><p className="mt-1 text-xs text-[#89948a]">Nearby organizations can request from your listing.</p></div><span className="grid size-9 place-items-center rounded-lg bg-[#edf4eb] text-[#54815d]"><Plus size={18} /></span></div>
          <form onSubmit={publish} className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-[#68776c] sm:col-span-2">Food name<input required maxLength="120" placeholder="e.g. Vegetable lunch boxes" className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#689372]" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label className="text-xs font-bold text-[#68776c]">Category<select className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] bg-white px-3 py-2.5 text-sm font-normal" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{['prepared', 'produce', 'bakery', 'dairy', 'pantry', 'other'].map((category) => <option key={category} value={category}>{category[0].toUpperCase() + category.slice(1)}</option>)}</select></label><div className="grid grid-cols-[1fr_1fr] gap-2"><label className="text-xs font-bold text-[#68776c]">Quantity<input required type="number" min="1" className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] px-3 py-2.5 text-sm font-normal" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label><label className="text-xs font-bold text-[#68776c]">Unit<select className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] bg-white px-3 py-2.5 text-sm font-normal" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })}>{['meals', 'kg', 'boxes', 'items'].map((unit) => <option key={unit}>{unit}</option>)}</select></label></div><label className="text-xs font-bold text-[#68776c] sm:col-span-2">Pickup address<input required className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] px-3 py-2.5 text-sm font-normal" value={form.pickupAddress} onChange={(event) => setForm({ ...form, pickupAddress: event.target.value })} /></label><label className="text-xs font-bold text-[#68776c] sm:col-span-2">Pickup by<input required type="datetime-local" min={minimumPickupDate} className="mt-1.5 w-full rounded-lg border border-[#dfe5dc] px-3 py-2.5 text-sm font-normal" value={form.pickupBy} onChange={(event) => setForm({ ...form, pickupBy: event.target.value })} /></label><label className="text-xs font-bold text-[#68776c] sm:col-span-2">Notes<textarea rows="2" maxLength="1000" placeholder="Ingredients, storage, or collection details" className="mt-1.5 w-full resize-y rounded-lg border border-[#dfe5dc] px-3 py-2.5 text-sm font-normal" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><button disabled={busy} className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#24573a] px-4 py-3 text-sm font-bold text-white hover:bg-[#19462d] disabled:opacity-60 sm:col-span-2"><Plus size={16} /> Publish food</button></form>
        </section><div className="space-y-3">{cards.map(([label, value, Icon]) => <article key={label} className="flex items-center justify-between rounded-xl border border-[#e1e7dd] bg-white p-5"><div><p className="text-xs font-semibold text-[#849086]">{label}</p><p className="display-font mt-1 text-[27px] font-bold text-[#304737]">{value}</p></div><span className="grid size-10 place-items-center rounded-lg bg-[#eef4ec] text-[#5a8060]"><Icon size={18} /></span></article>)}<div className="rounded-xl border border-[#dfe8dc] bg-[#eaf1e7] p-5"><p className="text-xs font-bold tracking-wide text-[#638068]">GOOD TO KNOW</p><p className="mt-2 text-sm leading-6 text-[#54695a]">Once a request is approved, a volunteer can claim the delivery. The recipient confirms when it arrives.</p></div></div>
      </div>}

      {user.role === 'donor' && visibleTab === 'donations' && <div className="space-y-3">{data.donations.length ? data.donations.map((donation) => <article key={donation._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e1e7dd] bg-white p-5"><div><div className="flex flex-wrap items-center gap-2"><h3 className="display-font font-bold text-[#34483a]">{donation.title}</h3><Status value={donation.status} /></div><p className="mt-1 text-sm text-[#829087]">{donation.quantity} {donation.unit} · Pickup by {formatDate(donation.pickupBy)} · {donation.pickupAddress}</p></div>{donation.status === 'available' && <ActionButton tone="red" disabled={busy} onClick={() => run(() => api(`/donations/${donation._id}/cancel`, { method: 'PATCH' }), 'Listing cancelled.')}>Cancel listing</ActionButton>}</article>) : <Empty title="No food listed yet" copy="Your published donations will appear here." />}</div>}

      {user.role === 'donor' && visibleTab === 'requests' && <div className="space-y-3">{data.requests.filter((request) => request.status === 'pending').length ? data.requests.map((request) => <article key={request._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e1e7dd] bg-white p-5"><div><div className="flex flex-wrap items-center gap-2"><h3 className="display-font font-bold text-[#34483a]">{request.donation?.title || 'Food request'}</h3><Status value={request.status} /></div><p className="mt-1 text-sm text-[#829087]">{request.ngo?.organizationName || request.ngo?.name} requested {request.quantity} {request.donation?.unit} · {formatDate(request.createdAt)}</p>{request.note && <p className="mt-2 text-sm text-[#617165]">“{request.note}”</p>}</div>{request.status === 'pending' && <div className="flex gap-2"><ActionButton disabled={busy} onClick={() => run(() => api(`/requests/${request._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) }), 'Request approved. A delivery is ready to be claimed.') }><Check size={14} /> Approve</ActionButton><ActionButton tone="red" disabled={busy} onClick={() => run(() => api(`/requests/${request._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) }), 'Request declined.') }><X size={14} /> Decline</ActionButton></div>}</article>) : <Empty title="All caught up" copy="New organization requests will show up here." />}</div>}

      {user.role === 'ngo' && visibleTab === 'overview' && <><div className="mb-5 grid gap-3 sm:grid-cols-3">{cards.map(([label, value, Icon]) => <article key={label} className="flex items-center justify-between rounded-xl border border-[#e1e7dd] bg-white p-4"><div><p className="text-xs font-semibold text-[#849086]">{label}</p><p className="display-font mt-1 text-2xl font-bold text-[#304737]">{value}</p></div><Icon className="text-[#628269]" size={19} /></article>)}</div><div className="grid gap-3 md:grid-cols-2">{data.donations.length ? data.donations.map((donation) => <article key={donation._id} className="rounded-xl border border-[#e1e7dd] bg-white p-5"><div className="flex justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-wide text-[#809080]">{donation.category}</p><h3 className="display-font mt-1 text-base font-bold text-[#34483a]">{donation.title}</h3></div><span className="text-sm font-bold text-[#46734f]">{donation.quantity} {donation.unit}</span></div><p className="mt-3 text-sm leading-5 text-[#7e8b81]">{donation.description || 'Fresh surplus food available for local pickup.'}</p><div className="mt-4 border-t border-[#edf0eb] pt-3 text-xs leading-5 text-[#849087]">{donation.donor?.organizationName || donation.donor?.name}<br />{donation.pickupAddress}<br />Collect by {formatDate(donation.pickupBy)}</div><ActionButton disabled={busy} onClick={() => requestFood(donation)}><ArrowDownToLine size={14} /> Request food</ActionButton></article>) : <div className="md:col-span-2"><Empty title="No food available right now" copy="New local listings will appear here." /></div>}</div></>}

      {user.role === 'ngo' && visibleTab === 'requests' && <div className="space-y-3">{data.requests.length ? data.requests.map((request) => <article key={request._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e1e7dd] bg-white p-5"><div><div className="flex items-center gap-2"><h3 className="display-font font-bold text-[#34483a]">{request.donation?.title || 'Food request'}</h3><Status value={request.status} /></div><p className="mt-1 text-sm text-[#829087]">{request.quantity} {request.donation?.unit} · Requested {formatDate(request.createdAt)}</p>{request.donation?.pickupAddress && <p className="mt-1 text-sm text-[#65756a]">Pickup: {request.donation.pickupAddress}</p>}</div>{request.status === 'approved' && <span className="text-xs font-semibold text-[#6c7b6e]">Waiting for volunteer delivery</span>}</article>) : <Empty title="No requests yet" copy="Requests you send to donors will be tracked here." />}</div>}

      {user.role === 'volunteer' && visibleTab === 'overview' && <><div className="mb-5 grid gap-3 sm:grid-cols-3">{cards.map(([label, value, Icon]) => <article key={label} className="flex items-center justify-between rounded-xl border border-[#e1e7dd] bg-white p-4"><div><p className="text-xs font-semibold text-[#849086]">{label}</p><p className="display-font mt-1 text-2xl font-bold text-[#304737]">{value}</p></div><Icon className="text-[#628269]" size={19} /></article>)}</div><h2 className="display-font mb-3 text-base font-bold text-[#3c5142]">Ready for pickup</h2><div className="grid gap-3 md:grid-cols-2">{data.available?.length ? data.available.map((delivery) => <DeliveryCard key={delivery._id} delivery={delivery} busy={busy} actionLabel="Claim delivery" onAction={() => run(() => api(`/deliveries/${delivery._id}/claim`, { method: 'PATCH' }), 'Delivery assigned to you.')} />) : <div className="md:col-span-2"><Empty title="No deliveries to claim" copy="Approved food requests will appear here." /></div>}</div></>}

      {user.role === 'volunteer' && visibleTab === 'deliveries' && <div className="grid gap-3 md:grid-cols-2">{data.deliveries.length ? data.deliveries.map((delivery) => <DeliveryCard key={delivery._id} delivery={delivery} busy={busy} actionLabel={delivery.status === 'assigned' ? 'Mark picked up' : delivery.status === 'picked_up' ? 'Mark delivered' : ''} onAction={() => run(() => api(`/deliveries/${delivery._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: delivery.status === 'assigned' ? 'picked_up' : 'delivered' }) }), delivery.status === 'assigned' ? 'Pickup marked complete.' : 'Recipient can now confirm receipt.')} />) : <div className="md:col-span-2"><Empty title="No deliveries assigned" copy="Claim a delivery when you are ready to help." /></div>}</div>}

      {user.role === 'admin' && visibleTab === 'overview' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[...cards, ['Requests', data.stats.requests || 0, ClipboardList]].map(([label, value, Icon]) => <article key={label} className="rounded-xl border border-[#e1e7dd] bg-white p-5"><span className="grid size-9 place-items-center rounded-lg bg-[#edf4eb] text-[#57805e]"><Icon size={17} /></span><p className="mt-5 text-xs font-semibold text-[#849086]">{label}</p><p className="display-font mt-1 text-[27px] font-bold text-[#304737]">{value}</p></article>)}</div>}

      {user.role === 'admin' && visibleTab === 'verification' && <div className="space-y-3">{data.pendingOrganizations.length ? data.pendingOrganizations.map((organization) => <article key={organization._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e1e7dd] bg-white p-5"><div><div className="flex items-center gap-2"><h3 className="display-font font-bold text-[#34483a]">{organization.organizationName || organization.name}</h3><span className="rounded-full bg-[#fff1d8] px-2.5 py-1 text-[11px] font-bold capitalize text-[#94671b]">{organization.role} · pending</span></div><p className="mt-1 text-sm text-[#829087]">{organization.name} · {organization.email}</p></div><div className="flex gap-2"><ActionButton disabled={busy} onClick={() => run(() => api(`/admin/users/${organization._id}/verification`, { method: 'PATCH', body: JSON.stringify({ status: 'verified' }) }), 'Organization verified.') }><Check size={14} /> Verify</ActionButton><ActionButton tone="red" disabled={busy} onClick={() => run(() => api(`/admin/users/${organization._id}/verification`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) }), 'Organization declined.') }><X size={14} /> Decline</ActionButton></div></article>) : <Empty title="No organizations to review" copy="New organization accounts will appear here." />}</div>}
    </main>
  )
}

function DeliveryCard({ delivery, busy, actionLabel, onAction }) {
  const donation = delivery.request?.donation
  const ngo = delivery.request?.ngo
  return <article className="rounded-xl border border-[#e1e7dd] bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-wide text-[#809080]">{donation?.category || 'Food pickup'}</p><h3 className="display-font mt-1 text-base font-bold text-[#34483a]">{donation?.title || 'Donation delivery'}</h3></div><Status value={delivery.status} /></div><p className="mt-3 text-sm text-[#65756a]">{delivery.request?.quantity} {donation?.unit} for {ngo?.organizationName || ngo?.name || 'local organization'}</p><div className="mt-3 border-t border-[#edf0eb] pt-3 text-xs leading-5 text-[#849087]">Pickup: {donation?.pickupAddress || 'Address pending'}<br />By {donation?.pickupBy ? formatDate(donation.pickupBy) : 'Confirm with donor'}</div>{actionLabel && <div className="mt-4"><ActionButton disabled={busy} onClick={onAction}><ArrowUpRight size={14} /> {actionLabel}</ActionButton></div>}</article>
}