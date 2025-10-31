import { NextResponse } from 'next/server';
import { validateCreds, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  const { user, pass } = await request.json();
  if (!validateCreds(String(user||''), String(pass||''))) {
    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
  }
  const token = await signToken({ sub: 'admin', exp: Date.now() + 1000*60*60*8 }); // 8h
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admintoken', token, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
  return res;
}
