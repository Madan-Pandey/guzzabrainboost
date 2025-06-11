import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { playerId, currentLevel } = await req.json();

        // Validate input
        if (!playerId || !currentLevel) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get current player data
        const player = await prisma.player.findUnique({
            where: { Player_ID: playerId },
            include: {
                level_scores: {
                    where: { level_number: currentLevel }
                }
            }
        });

        if (!player) {
            return NextResponse.json(
                { error: "Player not found" },
                { status: 404 }
            );
        }

        // Verify player is at the correct level
        if (player.Level_Id !== currentLevel) {
            return NextResponse.json(
                { 
                    error: "Invalid level attempt", 
                    message: "You must complete previous levels first",
                    details: { 
                        currentLevel, 
                        playerLevel: player.Level_Id 
                    }
                },
                { status: 400 }
            );
        }

        // All validations passed
        return NextResponse.json({
            success: true,
            message: "Level validation successful",
            data: {
                playerId,
                currentLevel,
                previousScore: player.level_scores[0]?.highest_score || 0
            }
        });

    } catch (error) {
        console.error('Error validating level:', error);
        return NextResponse.json(
            { 
                error: "Failed to validate level", 
                message: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
} 