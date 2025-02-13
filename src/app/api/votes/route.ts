import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { themeId, voterName } = await request.json();

    // Check if voter has already voted
    const existingVote = await prisma.vote.findFirst({
      where: { voterName },
    });

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted' }, { status: 400 });
    }

    // Check if theme has reached max votes
    const theme = await prisma.theme.findUnique({
      where: { id: themeId },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!theme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    if (theme._count.votes >= theme.maxVotes) {
      return NextResponse.json(
        { error: 'This theme has reached its maximum votes' },
        { status: 400 },
      );
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: {
        themeId,
        voterName,
      },
    });

    return NextResponse.json(vote);
  } catch {
    return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
  }
}
