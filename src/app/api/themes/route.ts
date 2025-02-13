import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface CachedTheme {
  id: string;
  name: string;
  maxVotes: number;
  _count: {
    votes: number;
  };
}

// Cache for themes data
let themesCache: CachedTheme[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

export async function GET() {
  try {
    // Check cache first
    const now = Date.now();
    if (themesCache && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json(themesCache);
    }

    const themes = await prisma.theme.findMany({
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!themes || themes.length === 0) {
      // If no themes exist, create them
      const seedThemes = [
        { name: 'Italian', maxVotes: 100 },
        { name: 'Mexican', maxVotes: 100 },
        { name: 'Chinese', maxVotes: 100 },
        { name: 'Indian', maxVotes: 100 },
        { name: 'Mediterranean', maxVotes: 100 },
      ];

      const createdThemes = await Promise.all(
        seedThemes.map(theme =>
          prisma.theme.create({
            data: theme,
            include: {
              _count: {
                select: { votes: true },
              },
            },
          }),
        ),
      );

      // Update cache
      themesCache = createdThemes;
      lastFetchTime = now;

      return NextResponse.json(createdThemes);
    }

    // Update cache
    themesCache = themes;
    lastFetchTime = now;

    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    // If cache exists, return it as fallback
    if (themesCache) {
      return NextResponse.json(themesCache);
    }
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

    // Invalidate cache
    themesCache = null;

    return NextResponse.json(theme);
  } catch (error) {
    console.error('Error creating theme:', error);
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 });
  }
}
