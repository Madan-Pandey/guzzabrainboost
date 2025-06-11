import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LevelScore } from "@prisma/client";

// Milestone thresholds for rewards
const MILESTONE_THRESHOLDS = {
  1: { levels: 10, bonus: 100 },
  2: { levels: 20, bonus: 150 },
  3: { levels: 30, bonus: 200 },
  4: { levels: 40, bonus: 250 },
  5: { levels: 50, bonus: 300 }
};

export async function POST(request: Request) {
  try {
    const { playerId, score, levelNumber, completionPercentage } = await request.json();

    if (typeof score !== 'number' || !levelNumber) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    const finalPlayerId = playerId || 1;

    // Calculate stars based on completion percentage and all correct answers
    let stars = 0;
    const maxPossibleScore = score >= 20 ? score : 20; // Each question is worth 20 points
    const isAllCorrectFirstTry = score === maxPossibleScore; // Only true if all answers correct in one try

    if (isAllCorrectFirstTry) {
      stars = 4; // All correct in one try
    } else if (completionPercentage >= 80) {
      stars = 3;
    } else if (completionPercentage >= 65) {
      stars = 2;
    } else if (completionPercentage >= 50) {
      stars = 1;
    }

    // Update or create level score
    const existingScore = await prisma.levelScore.findUnique({
      where: {
        player_id_level_number: {
          player_id: finalPlayerId,
          level_number: levelNumber,
        },
      }
    });

    const levelScore = await prisma.levelScore.upsert({
      where: {
        player_id_level_number: {
          player_id: finalPlayerId,
          level_number: levelNumber,
        },
      },
      update: {
        latest_score: score,
        highest_score: existingScore ? Math.max(existingScore.highest_score, score) : score,
        completion_percentage: existingScore ? Math.max(existingScore.completion_percentage, completionPercentage) : completionPercentage,
        stars: existingScore ? Math.max(existingScore.stars, stars) : stars
      },
      create: {
        player_id: finalPlayerId,
        level_number: levelNumber,
        latest_score: score,
        highest_score: score,
        completion_percentage: completionPercentage,
        stars: stars
      },
    });

    // If score is sufficient (>= 50%), unlock next level
    if (completionPercentage >= 50) {
      const nextLevelNumber = levelNumber + 1;
      
      // Check if next level exists
      const nextLevelExists = await prisma.level.findFirst({
        where: { Level_number: nextLevelNumber }
      });

      if (nextLevelExists) {
        // Create next level's score record to unlock it
        await prisma.levelScore.upsert({
          where: {
            player_id_level_number: {
              player_id: finalPlayerId,
              level_number: nextLevelNumber,
            },
          },
          update: {}, // Don't update if exists
          create: {
            player_id: finalPlayerId,
            level_number: nextLevelNumber,
            latest_score: 0,
            highest_score: 0,
            completion_percentage: 0,
            stars: 0
          },
        });

        // Update milestone if needed
        const currentMilestone = await prisma.milestone.findFirst({
          where: {
            UnlockingLevel: {
              lte: nextLevelNumber
            }
          },
          orderBy: {
            UnlockingLevel: 'desc'
          }
        });

        if (currentMilestone) {
          await prisma.player.update({
            where: { Player_ID: finalPlayerId },
            data: {
              Milestone_Id: currentMilestone.Milestone_Id
            }
          });
        }
      }
    }

    // Calculate total points from all level scores
    const allLevelScores = await prisma.levelScore.findMany({
      where: { player_id: finalPlayerId }
    });

    const totalPoints = allLevelScores.reduce((total, score) => {
      return total + score.highest_score;
    }, 0);

    // Get highest completed level
    const highestCompletedLevel = Math.max(
      ...allLevelScores
        .filter(score => score.completion_percentage >= 50)
        .map(score => score.level_number)
    );

    // Update player's total points and level
    await prisma.player.update({
      where: { Player_ID: finalPlayerId },
      data: {
        Playerpoint: totalPoints,
        Level_Id: highestCompletedLevel + 1 // Set to next level after highest completed
      }
    });

    // Get updated player data with all relations
    const player = await prisma.player.findUnique({
      where: { Player_ID: finalPlayerId },
      include: {
        level_scores: true,
        Milestone: true,
        Level: true
      }
    });

    return NextResponse.json({
      success: true,
      player,
      levelScore,
      totalPoints,
      events: ['scoreUpdated', 'levelCompleted']
    });

  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json(
      { error: 'Failed to update score' },
      { status: 500 }
    );
  }
}