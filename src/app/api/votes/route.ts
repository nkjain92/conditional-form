import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sanitizeThemeName } from '@/lib/utils';

interface VoteData {
  themeId: string;
  voterName: string;
}

function isValidVoteData(data: any): data is VoteData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.themeId === 'string' &&
    data.themeId.length > 0 &&
    typeof data.voterName === 'string' &&
    data.voterName.trim().length > 0
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate vote data
    if (!isValidVoteData(body)) {
      return NextResponse.json(
        { error: 'Invalid vote data. Theme ID and voter name are required.' },
        { status: 400 },
      );
    }

    const { themeId, voterName } = body;
    const sanitizedVoterName = voterName.trim();

    // Check if voter has already voted
    const existingVote = await prisma.vote.findFirst({
      where: { voterName: sanitizedVoterName },
    });

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted' }, { status: 400 });
    }

    // Check if theme exists and has not reached max votes
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

    // Create vote with sanitized voter name
    const vote = await prisma.vote.create({
      data: {
        id: `vote-${sanitizeThemeName(sanitizedVoterName)}-${Date.now()}`,
        themeId,
        voterName: sanitizedVoterName,
      },
      include: {
        theme: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error('Error creating vote:', error);
    return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
  }
}
