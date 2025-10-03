import { NextResponse } from 'next/server';
import { readLeads, writeLeads } from '@/lib/leads';

export async function POST(request: Request) {
  const body = await request.json();
  const { id, status, notes } = body || {};
  if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
  const list = await readLeads();
  const idx = list.findIndex(l => l.id === id);
  if (idx === -1) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  if (status) list[idx].status = status;
  if (typeof notes === 'string') list[idx].notes = notes;
  await writeLeads(list);
  return NextResponse.json({ ok: true });
}
