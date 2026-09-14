import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Array of paths that don't require authentication
const publicPaths = ['/login', '/register', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public path
  const isPublicPath = publicPaths.includes(pathname);

  // Check for session cookie
  const sessionId = request.cookies.get('sessionId')?.value || '';

  // If the user is on a public path (like /login) and HAS a session, redirect to dashboard
  if (isPublicPath && sessionId) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user is trying to access a protected path without a session, redirect to login
  if (!isPublicPath && !sessionId && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Config ensures middleware only runs on matched paths
export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*',
  ],
};
