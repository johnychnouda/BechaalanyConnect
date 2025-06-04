import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect /about to /about-us if needed
  if (pathname === '/about') {
    return NextResponse.redirect(new URL('/about-us', req.url));
  }

  // Add other middleware logic if needed

  return NextResponse.next();
}
