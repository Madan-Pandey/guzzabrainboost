import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"

// Milestone bonus points configuration
const MILESTONE_BONUSES = {
    1: 100,  // First milestone: 100 points
    2: 150,  // Second milestone: 150 points
    3: 200,  // Third milestone: 200 points
    4: 250,  // Fourth milestone: 250 points
    5: 300   // Fifth milestone: 300 points
};

export async function POST(req: Request) {
    try {
        const { playerId, nextMilestone } = await req.json()
        if (!playerId || !nextMilestone) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            )
        }

        // Get current player data with all relations
        const player = await prisma.player.findUnique({
            where: { Player_ID: playerId },
            include: { 
                Milestone: true,
                Level: true,
                level_scores: true
            }
        });

        if (!player) {
            return NextResponse.json(
                { message: "Player not found" },
                { status: 404 }
            );
        }

        // Calculate bonus points based on milestone
        const currentMilestoneId = player.Milestone_Id || 0;
        const basePoints = player.level_scores.reduce((total, score) => total + score.highest_score, 0);
        const bonusPoints = MILESTONE_BONUSES[currentMilestoneId as keyof typeof MILESTONE_BONUSES] || 0;
        const newTotalPoints = basePoints + bonusPoints;

        // Get completed levels
        const completedLevels = player.level_scores.filter(score => 
            score.completion_percentage >= 50
        );

        // Get next milestone data
        const nextMilestoneData = await prisma.milestone.findUnique({
            where: { Milestone_Id: nextMilestone }
        });

        if (!nextMilestoneData) {
            return NextResponse.json(
                { message: "Next milestone not found" },
                { status: 404 }
            );
        }

        // Update player with new milestone and bonus points
        const updatePlayer = await prisma.player.update({
            where: { 
                Player_ID: playerId
            }, 
            data: { 
                Milestone_Id: nextMilestone,
                Playerpoint: newTotalPoints,
                // Update level if needed
                Level_Id: Math.max(
                    player.Level_Id || 1,
                    nextMilestoneData.UnlockingLevel
                )
            },
            include: {
                Milestone: true,
                Level: true,
                level_scores: true
            }
        });

        // Create history record for the milestone completion
        await prisma.playerHistory.create({
            data: {
                player_id: playerId,
                level_completed: completedLevels.length,
                score_gained: bonusPoints
            }
        });

        return NextResponse.json({ 
            message: "Milestone completed successfully", 
            player: updatePlayer, 
            nextMilestone: nextMilestone,
            bonusPoints: bonusPoints,
            newTotalPoints: newTotalPoints,
            completedLevels: completedLevels.length
        }, { status: 201 });
    } catch (e) {
        console.error(e)
        return NextResponse.json({ message: "Failed to update milestone", error: e }, { status: 500 })
    }
}