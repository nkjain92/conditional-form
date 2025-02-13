import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    console.log('Fetching themes...');
    const themes = await prisma.theme.findMany({
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    console.log('Themes fetched:', themes);

    if (!themes || themes.length === 0) {
      console.log('No themes found, running seed...');
      // If no themes exist, create them
      const seedThemes = [
        { name: 'Italian', maxVotes: 100 },
        { name: 'Mexican', maxVotes: 100 },
        { name: 'Chinese', maxVotes: 100 },
        { name: 'Indian', maxVotes: 100 },
        { name: 'Mediterranean', maxVotes: 100 },
      ];

      for (const theme of seedThemes) {
        await prisma.theme.create({
          data: theme,
        });
      }

      // Fetch themes again after seeding
      const newThemes = await prisma.theme.findMany({
        include: {
          _count: {
            select: { votes: true },
          },
        },
      });

      console.log('Themes after seeding:', newThemes);
      return NextResponse.json(newThemes);
    }

    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
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
