import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { playerId, levelNumber, score, completionPercentage } = await request.json();

    if (!playerId || !levelNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Get player's current data
    const player = await prisma.player.findUnique({
      where: { Player_ID: playerId },
      include: {
        level_scores: true,
        Milestone: true
      }
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // 2. Update or create level score
    const levelScore = await prisma.levelScore.upsert({
      where: {
        player_id_level_number: {
          player_id: playerId,
          level_number: levelNumber
        }
      },
      update: {
        latest_score: score,
        highest_score: Math.max(score, player.level_scores.find(ls => ls.level_number === levelNumber)?.highest_score || 0),
        completion_percentage: Math.max(completionPercentage, player.level_scores.find(ls => ls.level_number === levelNumber)?.completion_percentage || 0)
      },
      create: {
        player_id: playerId,
        level_number: levelNumber,
        latest_score: score,
        highest_score: score,
        completion_percentage: completionPercentage
      }
    });

    // 3. Get all completed levels
    const completedLevels = player.level_scores
      .filter(score => score.completion_percentage >= 50)
      .map(score => score.level_number);
    completedLevels.push(levelNumber); // Add current level if not already included

    // 4. Calculate total points from all level scores
    const totalPoints = player.level_scores.reduce((total, score) => {
      if (score.level_number === levelNumber) {
        return total + Math.max(score.highest_score, levelScore.highest_score);
      }
      return total + score.highest_score;
    }, 0);

    // 5. Find the appropriate milestone based on completed levels
    const milestone = await prisma.milestone.findFirst({
      where: {
        UnlockingLevel: {
          lte: Math.max(...completedLevels) + 1
        }
      },
      orderBy: {
        UnlockingLevel: 'desc'
      }
    });

    // 6. Update player data
    const updatedPlayer = await prisma.player.update({
      where: { 
        Player_ID: playerId 
      },
      data: {
        Playerpoint: totalPoints,
        Level_Id: Math.max(...completedLevels) + 1,
        Milestone_Id: milestone?.Milestone_Id || player.Milestone_Id,
        lastLogin: new Date()
      },
      include: {
        level_scores: true,
        Milestone: true
      }
    });

    // 7. Add to player history
    await prisma.playerHistory.create({
      data: {
        player_id: playerId,
        level_completed: levelNumber,
        score_gained: score
      }
    });

    return NextResponse.json({
      success: true,
      levelScore,
      player: updatedPlayer,
      completedLevels: completedLevels.length
    });

  } catch (error) {
    console.error('Error completing level:', error);
    return NextResponse.json(
      { error: 'Failed to complete level' },
      { status: 500 }
    );
  }
} 