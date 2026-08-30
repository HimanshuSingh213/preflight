import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16+ Request Proxy & Boundary Guard (`proxy.ts`).
 * Intercepts incoming requests, manages API route headers, and handles desktop viewport / route boundary security.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security & streaming headers for API endpoints
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('X-PreFlight-Engine', 'v1.0-AST');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
