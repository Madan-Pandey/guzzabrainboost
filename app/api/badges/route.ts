import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { calculateScoreBadge, calculateStreakBadge, calculatePerfectBadge, calculateProgressBadge, calculateSectionBadge } from "@/utils/badges";
import { UserBadges } from "@/types/types";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const playerId = searchParams.get('playerId');

        if (!playerId) {
            return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
        }

        // Get player data with level scores
        const player = await prisma.player.findUnique({
            where: { Player_ID: Number(playerId) },
            include: {
                level_scores: {
                    orderBy: { level_number: 'asc' }
                }
            }
        });

        if (!player) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        // Calculate highest score
        const highestScore = Math.max(...player.level_scores.map(score => score.highest_score), 0);

        // Calculate consecutive scores above 80%
        const consecutiveScores = player.level_scores
            .sort((a, b) => a.level_number - b.level_number)
            .map(score => score.highest_score);

        // Count perfect scores (100%)
        const perfectScores = player.level_scores.filter(score => score.highest_score === 100).length;

        // Count completed levels (>= 50% completion)
        const completedLevels = player.level_scores.filter(score => score.completion_percentage >= 50).length;

        // Calculate section completion (levels completed in current section)
        const currentSection = Math.floor((player.Level_Id || 1) / 10);
        const sectionStart = currentSection * 10 + 1;
        const sectionEnd = (currentSection + 1) * 10;
        const sectionLevelsCompleted = player.level_scores.filter(
            score => score.level_number >= sectionStart &&
            score.level_number <= sectionEnd &&
            score.completion_percentage >= 50
        ).length;

        // Calculate all badges
        const badges: UserBadges = {
            scoreMaster: calculateScoreBadge(highestScore),
            streakChampion: calculateStreakBadge(consecutiveScores),
            perfectScore: calculatePerfectBadge(perfectScores),
            quizProgress: calculateProgressBadge(completedLevels),
            sectionMaster: calculateSectionBadge(sectionLevelsCompleted)
        };

        return NextResponse.json({ badges });
    } catch (error) {
        console.error('Error fetching badges:', error);
        return NextResponse.json(
            { error: 'Failed to fetch badges', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 