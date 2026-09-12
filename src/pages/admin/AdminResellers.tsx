import { FormEvent, useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { peso } from '../../lib/format'
import { revenueOf } from '../../lib/metrics'
import PageHeader from '../../components/PageHeader'
import Modal from '../../components/Modal'
import StatCard from '../../components/StatCard'
import { Check, Eye, Plus, Trash, Users, X } from '../../components/icons'

const inputCls = 'input'
const labelCls = 'label'

export default function AdminResellers() {
  const users = useStore((s) => s.users)
  const orders = useStore((s) => s.orders)
  const customPrices = useStore((s) => s.customPrices)
  const addUser = useStore((s) => s.addUser)
  const updateUser = useStore((s) => s.updateUser)
  const deleteUser = useStore((s) => s.deleteUser)

  const resellers = useMemo(
    () => users.filter((u) => u.role === 'reseller'),
    [users],
  )

  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState('')

  const openCreate = () => {
    setModal('create')
    setName('')
    setEmail('')
    setPassword('')
    setActive(true)
    setError('')
  }

  const openEdit = (id: string) => {
    const u = resellers.find((r) => r.id === id)
    if (!u) return
    setEditId(id)
    setModal('edit')
    setName(u.name)
    setEmail(u.email)
    setPassword('')
    setActive(u.active)
    setError('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.')
      return
    }
    if (modal === 'create') {
      if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setError('A user with that email already exists.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      addUser({ name: name.trim(), email: email.trim(), password, role: 'reseller', active })
    } else if (editId) {
      updateUser(editId, {
        name: name.trim(),
        email: email.trim(),
        active,
        ...(password ? { password } : {}),
      })
    }
    setModal(null)
  }

  const revenueFor = (resellerId: string): number =>
    orders
      .filter((o) => o.resellerId === resellerId && ['ordered', 'arrived', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + revenueOf(o), 0)

  const totalCustomRules = customPrices.length
  const productWithCustom = new Set(customPrices.map((cp) => cp.productId)).size

  const deleteMe = resellers.find((r) => r.id === confirmDelete)

  return (
    <div>
      <PageHeader
        title="Resellers"
        subtitle={`${resellers.length} reseller account(s)`}
        actions={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Add reseller
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active Resellers" value={resellers.filter((r) => r.active).length} icon={<Users size={18} />} tone="emerald" />
        <StatCard label="Pending Approval" value={resellers.filter((r) => !r.active).length} hint="awaiting review" icon={<Eye size={18} />} tone="amber" />
        <StatCard label="Custom Price Rules" value={totalCustomRules} hint={`across ${productWithCustom} products`} icon={<Eye size={18} />} tone="brand" />
      </div>

      {/* Pending approvals */}
      {resellers.filter((r) => !r.active).length > 0 && (
        <div className="card mt-6 overflow-hidden ring-2 ring-amber-200">
          <div className="flex items-center justify-between bg-amber-50 px-5 py-3">
            <h2 className="font-bold text-amber-800">Pending Approval</h2>
            <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              {resellers.filter((r) => !r.active).length}
            </span>
          </div>
          <div className="divide-y divide-ink-100">
            {resellers.filter((r) => !r.active).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
                    {r.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <div>
                    <p className="font-semibold text-ink-900">{r.name}</p>
                    <p className="text-xs text-ink-400">{r.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateUser(r.id, { active: true })}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    onClick={() => setConfirmDelete(r.id)}
                    className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-100"
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active resellers table */}
      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="tablehead">
              <tr>
                <th>Reseller</th>
                <th>Orders</th>
                <th>Purchases</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resellers.filter((r) => r.active).map((r) => {
                const myOrders = orders.filter((o) => o.resellerId === r.id)
                const pending = myOrders.filter((o) => o.status === 'pending').length
                return (
                  <tr key={r.id} className="tablerow">
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-bold text-white">
                          {r.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </span>
                        <div className="leading-tight">
                          <p className="font-semibold text-ink-900">{r.name}</p>
                          <p className="text-xs text-ink-400">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-medium text-ink-700">
                      {myOrders.length}
                      {pending > 0 && (
                        <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                          {pending} pending
                        </span>
                      )}
                    </td>
                    <td className="font-bold text-ink-900">{peso(revenueFor(r.id))}</td>
                    <td>
                      <button
                        onClick={() => updateUser(r.id, { active: !r.active })}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          r.active
                            ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                            : 'bg-ink-100 text-ink-500 ring-ink-200'
                        }`}
                        title="Toggle active"
                      >
                        {r.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(r.id)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 ring-1 ring-brand-200 transition hover:bg-brand-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete(r.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 ring-1 ring-red-200 transition hover:bg-red-50"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {resellers.filter((r) => r.active).length === 0 && (
                <tr className="tablerow">
                  <td colSpan={5} className="py-10 text-center text-sm text-ink-400">
                    No active resellers yet. Approve pending applications above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add reseller' : 'Edit reseller'}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={onSubmit} form="reseller-form" className="btn-primary">
              {modal === 'create' ? 'Create reseller' : 'Save changes'}
            </button>
          </div>
        }
      >
        <form id="reseller-form" onSubmit={onSubmit} className="space-y-4">
          {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200">{error}</div>}
          <div>
            <label className={labelCls}>Full name</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ana Cruz" />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ana@reseller.ph" />
          </div>
          <div>
            <label className={labelCls}>{modal === 'edit' ? 'New password (optional)' : 'Password'}</label>
            <input type="text" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="reseller123" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink-800">Account active</p>
              <p className="text-xs text-ink-400">Disabled resellers can't log in</p>
            </div>
            <button type="button" onClick={() => setActive((v) => !v)} className={`h-6 w-11 rounded-full transition-colors ${active ? 'bg-brand-600' : 'bg-ink-200'}`}>
              <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete reseller"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
            <button
              onClick={() => {
                if (confirmDelete) deleteUser(confirmDelete)
                setConfirmDelete(null)
              }}
              className="btn-danger"
            >
              Delete
            </button>
          </div>
        }
      >
        {deleteMe && (
          <p className="text-sm text-ink-600">
            Delete <span className="font-semibold text-ink-900">{deleteMe.name}</span>? Custom
            prices for this reseller will also be removed.
          </p>
        )}
      </Modal>
    </div>
  )
}