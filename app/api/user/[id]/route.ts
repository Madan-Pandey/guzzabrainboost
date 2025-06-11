import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Only allow users to fetch their own data
    if (session.user.memberId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const player = await prisma.player.findUnique({
      where: { Player_ID: userId },
      select: {
        Player_ID: true,
        Player_name: true,
        Playerpoint: true,
        Level_Id: true,
      }
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 