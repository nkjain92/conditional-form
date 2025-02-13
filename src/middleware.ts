import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Add paths that don't require authentication
const publicPaths = ['/', '/api/auth/signin', '/api/auth/signup', '/api/auth/signout'];

interface JwtPayload {
  userId: string;
}

export function middleware(request: NextRequest) {
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
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('user-id', decoded.userId);

    // Add user info to request
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return response;
  } catch {
    return NextResponse.json({ message: 'Invalid authentication token' }, { status: 401 });
  }
}

// Configure paths that should be protected
export const config = {
  matcher: ['/api/forms/:path*', '/api/themes/:path*', '/api/votes/:path*', '/dashboard/:path*'],
};
