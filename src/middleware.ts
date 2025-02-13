import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Add paths that don't require authentication
const publicPaths = ['/', '/api/auth/signin', '/api/auth/signup', '/api/auth/signout'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public paths
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('user-id', (decoded as any).userId);

    // Add user info to request
    return NextResponse.next({
      headers: requestHeaders,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid authentication token' }, { status: 401 });
  }
}

// Configure paths that should be protected
export const config = {
  matcher: ['/api/forms/:path*', '/api/themes/:path*', '/api/votes/:path*', '/dashboard/:path*'],
};
