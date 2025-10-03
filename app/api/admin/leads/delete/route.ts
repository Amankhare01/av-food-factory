import { NextResponse } from 'next/server';
import { readLeads, writeLeads } from '@/lib/leads';

export async function POST(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
  const list = await readLeads();
  const next = list.filter(l => l.id !== id);
  await writeLeads(next);
  return NextResponse.json({ ok: true });
}
