import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateId } from '@/lib/utils';
import { VoteData } from '@/lib/types';

function validateVoteData(data: unknown): { isValid: boolean; error?: string } {
  if (
    typeof data !== 'object' ||
    data === null ||
    typeof (data as VoteData).themeId !== 'string' ||
    !(data as VoteData).themeId.length ||
    typeof (data as VoteData).voterName !== 'string' ||
    !(data as VoteData).voterName.trim().length
  ) {
    return {
      isValid: false,
      error: 'Invalid vote data. Theme ID and voter name are required.',
    };
  }
  return { isValid: true };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate vote data
    const validation = validateVoteData(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { themeId, voterName } = body as VoteData;
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
        id: generateId('vote', sanitizedVoterName),
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
