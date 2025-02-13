import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const form = await prisma.form.findUnique({
      where: { id: params.id },
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

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json({ message: 'Failed to fetch form' }, { status: 500 });
  }
}
