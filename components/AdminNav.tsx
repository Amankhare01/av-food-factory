'use client';

export default function AdminNav() {
  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }
  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold">Admin • AV Food Factory</h1>
        <button onClick={logout} className="rounded bg-slate-900 text-white px-3 py-1.5 text-sm">Logout</button>
      </div>
    </div>
  );
}
