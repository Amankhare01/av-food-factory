'use client';
import { useState } from 'react';

export default function Login() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      });
      const data = await res.json();
      if (data.ok) window.location.href = '/admin';
      else setErr(data.error || 'Login failed');
    } catch(e:any) { setErr(e?.message || 'Network error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <input className="mt-4 w-full h-11 rounded border px-3" placeholder="Username" value={user} onChange={e=>setUser(e.target.value)} />
        <input className="mt-3 w-full h-11 rounded border px-3" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        <button disabled={loading} className="mt-4 w-full h-11 rounded bg-nawab-emerald text-white">{loading?'Signing in…':'Sign in'}</button>
      </form>
    </div>
  );
}
