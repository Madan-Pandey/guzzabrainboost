import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const playerId = searchParams.get('playerId');

        if (!playerId) {
            return NextResponse.json(
                { error: "Player ID is required" },
                { status: 400 }
            );
        }

        const history = await prisma.player_history.findMany({
            where: {
                player_id: Number(playerId)
            },
            orderBy: {
                timestamp: 'desc'
            }
        });

        return NextResponse.json({ 
            success: true,
            history
        }, { 
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
    } catch (error) {
        console.error('Error fetching level history:', error);
        return NextResponse.json(
            { error: "Failed to fetch level history", details: error },
            { status: 500 }
        );
    }
} 