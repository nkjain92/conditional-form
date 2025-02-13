import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserId } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, themes } = body;

    // Validate input
    if (!title || !themes || !Array.isArray(themes) || themes.length === 0) {
      return NextResponse.json(
        { message: 'Please provide a title and at least one option' },
        { status: 400 },
      );
    }

    // Validate each theme
    for (const theme of themes) {
      if (!theme.name || typeof theme.name !== 'string' || !theme.name.trim()) {
        return NextResponse.json({ message: 'Each option must have a name' }, { status: 400 });
      }
      if (theme.maxVotes && (isNaN(theme.maxVotes) || theme.maxVotes < 1)) {
        return NextResponse.json(
          { message: 'Maximum votes must be a positive number' },
          { status: 400 },
        );
      }
    }

    // Create form with themes
    const form = await prisma.form.create({
      data: {
        title,
        description,
        creatorId: userId,
        themes: {
          create: themes.map(theme => ({
            name: theme.name.trim(),
            maxVotes: theme.maxVotes || 3, // Default to 3 if not specified
          })),
        },
      },
      include: {
        themes: true,
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Create form error:', error);
    return NextResponse.json(
      { message: 'Failed to create form. Please try again.' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const forms = await prisma.form.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        themes: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error('Fetch forms error:', error);
    return NextResponse.json({ message: 'Failed to fetch forms' }, { status: 500 });
  }
}
