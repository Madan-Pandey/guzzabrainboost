import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { playerId, levelNumber } = await request.json();

        if (!playerId || !levelNumber) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if level score already exists
        const existingScore = await prisma.levelScore.findFirst({
            where: {
                player_id: playerId,
                level_number: levelNumber
            }
        });

        if (!existingScore) {
            // Create new level score record to unlock the level
            await prisma.levelScore.create({
                data: {
                    player_id: playerId,
                    level_number: levelNumber,
                    highest_score: 0,
                    latest_score: 0,
                    completion_percentage: 0,
                    stars: 0
                }
            });
        }

        // Update player's current level if needed
        await prisma.player.update({
            where: { Player_ID: playerId },
            data: { Level_Id: levelNumber }
        });

        // Get all level scores to return updated state
        const allLevelScores = await prisma.levelScore.findMany({
            where: { player_id: playerId },
            orderBy: { level_number: 'asc' }
        });

        return NextResponse.json({
            success: true,
            levelScores: allLevelScores
        });
    } catch (error) {
        console.error('Error unlocking level:', error);
        return NextResponse.json(
            { error: 'Failed to unlock level', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 