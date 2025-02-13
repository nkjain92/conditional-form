import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const themes = await prisma.theme.findMany({
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    return NextResponse.json(themes);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, maxVotes } = await request.json();

    const theme = await prisma.theme.create({
      data: {
        name,
        maxVotes,
      },
    });

    return NextResponse.json(theme);
  } catch {
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 });
  }
}
