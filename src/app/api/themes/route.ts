import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { validateThemeData, sanitizeThemeName, generateId } from '@/lib/utils';
import { CachedTheme, ThemeData } from '@/lib/types';

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

    console.log('Fetching themes from database...');
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
    console.log('Themes fetched:', themes);

    if (!themes || themes.length === 0) {
      console.log('No themes found, creating system user...');
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
      console.log('System user created/found:', systemUser.id);

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
      const seedThemes: ThemeData[] = [
        { name: 'Italian', maxVotes: 100, formId: defaultForm.id },
        { name: 'Mexican', maxVotes: 100, formId: defaultForm.id },
        { name: 'Chinese', maxVotes: 100, formId: defaultForm.id },
        { name: 'Indian', maxVotes: 100, formId: defaultForm.id },
        { name: 'Mediterranean', maxVotes: 100, formId: defaultForm.id },
      ].sort((a, b) => a.name.localeCompare(b.name));

      const createdThemes = await Promise.all(
        seedThemes.map(async theme => {
          const sanitizedName = sanitizeThemeName(theme.name);
          const themeId = generateId('default', sanitizedName);

          // Check if theme already exists
          const existingTheme = await prisma.theme.findUnique({
            where: { id: themeId },
            include: {
              _count: {
                select: { votes: true },
              },
            },
          });

          if (existingTheme) {
            return existingTheme;
          }

          return prisma.theme.create({
            data: {
              id: themeId,
              name: theme.name, // Keep original name for display
              maxVotes: theme.maxVotes,
              formId: theme.formId,
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
    console.error('Detailed error in themes GET:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate theme data
    const validation = validateThemeData(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, maxVotes, formId } = body as Required<ThemeData>;
    const themeId = generateId('theme', name);

    // Check if theme already exists
    const existingTheme = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (existingTheme) {
      return NextResponse.json({ error: 'Theme already exists' }, { status: 400 });
    }

    // Create theme
    const theme = await prisma.theme.create({
      data: {
        id: themeId,
        name, // Keep original name for display
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
