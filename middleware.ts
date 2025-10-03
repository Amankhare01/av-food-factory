import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isLogin = pathname.startsWith('/admin/login') || pathname.startsWith('/api/admin/login');
  if (!needsAuth || isLogin) return NextResponse.next();

  const cookie = req.cookies.get('admintoken')?.value;
  const payload = verifyToken(cookie);
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*','/api/admin/:path*']
};
