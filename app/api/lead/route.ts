import { NextResponse } from 'next/server';
import { readLeads, writeLeads, type Lead } from '@/lib/leads';
import { notifyEmail, notifyWhatsApp, autoReplyLead } from '@/lib/notify';
import { allow } from '@/lib/ratelimits';

function genId() { return (Date.now().toString(36) + Math.random().toString(36).slice(2,8)).toUpperCase(); }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.company) return NextResponse.json({ ok: false, error: 'Blocked' }, { status: 400 });
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const gate = await allow(ip, 5);
    if (!gate.ok) return NextResponse.json({ ok: false, error: 'Too many requests. Please try again later.' }, { status: 429 });

    const name = (body.name || '').toString().trim();
    const phone = (body.phone || '').toString().trim();
    const guests = (body.guests || '').toString().trim();
    const source = (body.source || '').toString().trim() || 'homepage-cta';
    if (!name || !phone) return NextResponse.json({ ok: false, error: 'Missing name or phone' }, { status: 400 });
    const ua = request.headers.get('user-agent');

    const lead: Lead = { id: genId(), name, phone, guests, source, createdAt: new Date().toISOString(), ip, ua, status: 'new' };
    const list = await readLeads();
    list.push(lead);
    await writeLeads(list);

    try { await notifyEmail(lead); } catch {}
    try { await notifyWhatsApp(lead); } catch {}
    try { await autoReplyLead(lead); } catch {}

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
