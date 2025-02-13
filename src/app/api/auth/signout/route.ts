import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Signed out successfully' });
    response.cookies.delete('auth-token');
    return response;
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json({ message: 'Failed to sign out' }, { status: 500 });
  }
}
