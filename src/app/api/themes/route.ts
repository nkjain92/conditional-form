import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { isValidThemeData, sanitizeThemeName } from '@/lib/utils';

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
      where: {
        form: {
          id: 'default',
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (!themes || themes.length === 0) {
      // Get or create system user
      const systemUser = await prisma.user.upsert({
        where: { email: 'system@example.com' },
        update: {},
        create: {
          id: 'system',
          email: 'system@example.com',
          password: await bcrypt.hash('system-password-not-used', 10),
        },
      });

      // Get or create default form
      const defaultForm = await prisma.form.upsert({
        where: { id: 'default' },
        update: {},
        create: {
          id: 'default',
          title: 'Default Voting Form',
          description: 'Default form for theme voting',
          creatorId: systemUser.id,
        },
      });

      // If no themes exist, create them with form relationship
      const seedThemes = [
        { name: 'Italian', maxVotes: 100 },
        { name: 'Mexican', maxVotes: 100 },
        { name: 'Chinese', maxVotes: 100 },
        { name: 'Indian', maxVotes: 100 },
        { name: 'Mediterranean', maxVotes: 100 },
      ];

      const createdThemes = await Promise.all(
        seedThemes.map(async theme => {
          const sanitizedName = sanitizeThemeName(theme.name);
          return prisma.theme.create({
            data: {
              id: `default-${sanitizedName}`,
              name: theme.name,
              maxVotes: theme.maxVotes,
              formId: defaultForm.id,
            },
            include: {
              _count: {
                select: { votes: true },
              },
            },
          });
        }),
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
    const body = await request.json();

    // Validate theme data
    if (!isValidThemeData(body)) {
      return NextResponse.json(
        { error: 'Invalid theme data. Name and maxVotes are required.' },
        { status: 400 },
      );
    }

    const { name, maxVotes, formId } = body;

    // Check if form exists
    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Create theme with sanitized name
    const sanitizedName = sanitizeThemeName(name);
    const theme = await prisma.theme.create({
      data: {
        id: `theme-${sanitizedName}-${Date.now()}`,
        name,
        maxVotes,
        formId,
      },
      include: {
        _count: {
          select: { votes: true },
        },
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
