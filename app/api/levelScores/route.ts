import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Helper function to ensure level scores exist for local development
async function ensureLevelScoresExist(playerId: number) {
    try {
        // Check if any level scores exist for the player
        const existingScores = await prisma.levelScore.findMany({
            where: { player_id: playerId }
        });

        // If no scores exist, create initial records for levels 1-6
        if (existingScores.length === 0) {
            const levelsToCreate = Array.from({ length: 6 }, (_, i) => ({
                player_id: playerId,
                level_number: i + 1,
                highest_score: 0,
                latest_score: 0,
                completion_percentage: 0,
                stars: 0
            }));

            await prisma.levelScore.createMany({
                data: levelsToCreate,
                skipDuplicates: true
            });
        }
    } catch (error) {
        console.error('Error ensuring level scores exist:', error);
    }
}

export async function GET() {
    try {
        const session = await auth();
        
        // For local development, use a default player ID if not logged in
        const playerId = session?.user?.memberId || 1;

        // Ensure level scores exist for local development
        if (!session?.user) {
            await ensureLevelScoresExist(Number(playerId));
        }

        // Get all level scores for the player
        const levelScores = await prisma.levelScore.findMany({
            where: {
                player_id: Number(playerId)
            },
            orderBy: {
                level_number: 'asc'
            },
            select: {
                level_number: true,
                highest_score: true,
                latest_score: true,
                completion_percentage: true,
                stars: true
            }
        });

        // Convert to a map of level number to score data
        const scores = levelScores.reduce((acc, score) => {
            acc[score.level_number] = {
                stars: score.stars,
                completionPercentage: score.completion_percentage,
                highestScore: score.highest_score,
                latestScore: score.latest_score
            };
            return acc;
        }, {} as Record<number, { 
            stars: number; 
            completionPercentage: number;
            highestScore: number;
            latestScore: number;
        }>);

        // Debug log
        console.log('Fetched level scores:', scores);

        return NextResponse.json({ scores });
    } catch (error) {
        console.error('Error fetching level scores:', error);
        return NextResponse.json(
            { error: 'Failed to fetch level scores', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 