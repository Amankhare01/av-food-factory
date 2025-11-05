'use client';
import { useEffect, useState } from 'react';

type Lead = {
  _id: string; name: string; phone: string; guests?: string; status?: string;
  source?: string; createdAt: string; notes?: string;
};

export default function AdminTable() {
  const [items, setItems] = useState<Lead[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);


function statusColor(s: string) {
  switch (s) {
    case 'new': return 'bg-green-300 text-black border-black';
    case 'contacted': return 'bg-blue-300 text-black border-black';
    case 'closed': return 'bg-yellow-300 text-black border-black';
    default: return 'bg-slate-100 text-slate-900 border-black';
  }
}

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/leads/list?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`, {
      cache: 'no-store'
    });
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function update(id: string, next: Partial<Lead>) {
    await fetch('/api/admin/leads/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ id, ...next })
    });
    await load();
  }

  async function del(id: string) {
    if (!confirm('Delete this lead?')) return;
    await fetch('/api/admin/leads/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ id })
    });
    await load();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-wrap gap-2 items-center">
        <input className="h-11 rounded border px-3" placeholder="Search name/phone/source..." value={q} onChange={e=>setQ(e.target.value)} />
        <select title='Details' className="h-11 rounded border px-3" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
        <button onClick={load} className="h-11 rounded bg-nawab-emerald text-white px-4">{loading?'Loading…':'Filter'}</button>
        <a href="/api/admin/leads/export" className="h-11 rounded border px-4 grid place-items-center">Export CSV</a>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b bg-slate-50">
              <th className="p-3">When</th>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Guests</th>
              <th className="p-3">Status</th>
              <th className="p-3">Source</th>
              <th className="p-3">Notes</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(l => (
              <tr key={l._id} className="border-b hover:bg-slate-50/50">
                <td className="p-3 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="p-3">{l.name}</td>
                <td className="p-3">{l.phone}</td>
                <td className="p-3">{l.guests || '-'}</td>
                <td className="p-3">
                  <select
  title='Details'
  value={l.status || 'new'}
  onChange={e => update(l._id, { status: e.target.value })}
  className={`rounded border px-2 py-1 ${statusColor(l.status || 'new')}`}
>
  <option value="new">new</option>
  <option value="contacted">contacted</option>
  <option value="closed">closed</option>
</select>

                </td>
                <td className="p-3">{l.source || '-'}</td>
                <td className="p-3">
                  <input
                    defaultValue={l.notes || ''}
                    onBlur={e => update(l._id, { notes: e.target.value })}
                    className="w-56 rounded border px-2 py-1"
                    placeholder="Add note…"
                  />
                </td>
                <td className="p-3">
                  <button onClick={() => del(l._id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr><td className="p-6 text-center text-slate-500" colSpan={8}>No leads yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
