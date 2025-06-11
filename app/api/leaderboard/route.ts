import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get all players with their level scores
    const players = await prisma.player.findMany({
      select: {
        Player_ID: true,
        Player_name: true,
        Playerpoint: true,
        streak: true,
        Level_Id: true
      },
      orderBy: {
        Playerpoint: 'desc'
      }
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
} 