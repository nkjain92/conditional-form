import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserId, validateThemeData, sanitizeThemeName } from '@/lib/utils';
import { FormData } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, themes } = body as FormData;

    // Validate input
    if (!title || !themes || !Array.isArray(themes) || themes.length === 0) {
      return NextResponse.json({ message: 'Invalid form data' }, { status: 400 });
    }

    // Validate themes data
    const invalidThemes = themes.map(validateThemeData).filter(result => !result.isValid);
    if (invalidThemes.length > 0) {
      return NextResponse.json({ message: invalidThemes[0].error }, { status: 400 });
    }

    // Create form with themes
    const form = await prisma.form.create({
      data: {
        title,
        description,
        creatorId: userId,
        themes: {
          create: themes.map(theme => ({
            name: sanitizeThemeName(theme.name),
            maxVotes: theme.maxVotes,
          })),
        },
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
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Create form error:', error);
    return NextResponse.json({ message: 'Failed to create form' }, { status: 500 });
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
