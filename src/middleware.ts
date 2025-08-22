import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected paths that require authentication
const protectedPaths = [
  '/profile',
  '/account-dashboard',
  '/account-dashboard/account-settings',
  '/account-dashboard/my-orders',
  '/account-dashboard/my-payments',
  '/account-dashboard/add-credits',
  // Add other protected routes here
];

// Define admin-only paths
const adminPaths = [
  '/admin',
  // Add other admin routes here
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect /about to /about-us if needed
  if (pathname === '/about') {
    return NextResponse.redirect(new URL('/about-us', req.url));
  }

  // Check authentication for protected routes
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath || isAdminPath) {
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      // If not authenticated, redirect to login
      if (!token) {
        const url = new URL('/auth/signin', req.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }
      
      // Check admin routes - ensure token has role property
      if (isAdminPath) {
        const userRole = (token as any)?.role || (token as any)?.laravelUser?.role;
        if (userRole !== 'admin') {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
    } catch (error) {
      console.error('Middleware authentication error:', error);
      // If there's an error with token verification, redirect to login
      const url = new URL('/auth/signin', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
