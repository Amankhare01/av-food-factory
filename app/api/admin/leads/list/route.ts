import { NextResponse } from 'next/server';
import { readLeads } from '@/lib/leads';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').toLowerCase();
  const status = url.searchParams.get('status') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const per = Math.min(100, parseInt(url.searchParams.get('per') || '25'));

  const all = await readLeads();
  const filtered = all.filter(l => {
    const matchQ = !q || [l.name, l.phone, l.guests, l.source].filter(Boolean).join(' ').toLowerCase().includes(q);
    const matchS = !status || l.status === status;
    return matchQ && matchS;
  }).sort((a,b) => (a.createdAt < b.createdAt ? 1 : -1));

  const total = filtered.length;
  const start = (page-1)*per;
  const items = filtered.slice(start, start+per);
  return NextResponse.json({ ok: true, total, page, per, items });
}
