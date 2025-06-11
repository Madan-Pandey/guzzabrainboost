import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Milestone ranges
const MILESTONE_RANGES = {
  1: [1, 10],   // Beginner: Levels 1-10
  2: [11, 20],  // Elementary: Levels 11-20
  3: [21, 30],  // Intermediate: Levels 21-30
  4: [31, 40],  // Advanced: Levels 31-40
  5: [41, 50]   // Expert: Levels 41-50
};

// Milestone bonus points
const MILESTONE_BONUSES = {
  1: 100,  // First milestone: 100 points
  2: 150,  // Second milestone: 150 points
  3: 200,  // Third milestone: 200 points
  4: 250,  // Fourth milestone: 250 points
  5: 300   // Fifth milestone: 300 points
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    const levelNumber = searchParams.get('levelNumber');

    if (!playerId || !levelNumber) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get player's current milestone and level scores
    const player = await prisma.player.findUnique({
      where: { Player_ID: parseInt(playerId) },
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

    // Get completed levels
    const completedLevels = player.level_scores
      .filter(score => score.completion_percentage >= 50)
      .map(score => score.level_number);

    // Find current milestone based on level number
    let currentMilestoneId = 1;
    for (const [id, range] of Object.entries(MILESTONE_RANGES)) {
      const [start, end] = range;
      if (parseInt(levelNumber) >= start && parseInt(levelNumber) <= end) {
        currentMilestoneId = parseInt(id);
        break;
      }
    }

    // Get range for current milestone
    const [rangeStart, rangeEnd] = MILESTONE_RANGES[currentMilestoneId as keyof typeof MILESTONE_RANGES];

    // Check if all levels in current milestone range are completed
    const levelsInRange = Array.from(
      { length: rangeEnd - rangeStart + 1 },
      (_, i) => rangeStart + i
    );

    const allLevelsInRangeCompleted = levelsInRange.every(level => 
      completedLevels.includes(level)
    );

    // Only proceed if all levels in range are completed AND this milestone hasn't been claimed yet
    if (allLevelsInRangeCompleted && player.Milestone_Id !== currentMilestoneId + 1) {
      const nextMilestoneId = currentMilestoneId + 1;
      const bonus = MILESTONE_BONUSES[currentMilestoneId as keyof typeof MILESTONE_BONUSES];

      // Get milestone data
      const milestone = await prisma.milestone.findUnique({
        where: { Milestone_Id: nextMilestoneId }
      });

      if (milestone) {
        // Update player's milestone
        await prisma.player.update({
          where: { Player_ID: parseInt(playerId) },
          data: { Milestone_Id: nextMilestoneId }
        });

        return NextResponse.json({
          milestone: {
            id: nextMilestoneId,
            bonus,
            title: milestone.Milestone_Title,
            description: milestone.Milestone_description,
            unlockLevel: milestone.UnlockingLevel,
            reward_message: milestone.Milestone_reward_message,
            button_cta: milestone.Milestone_Button_CTA,
            link: milestone.Milestone_Link
          }
        });
      }
    }

    return NextResponse.json({ milestone: null });
  } catch (error) {
    console.error('Error checking milestone:', error);
    return NextResponse.json(
      { error: 'Failed to check milestone' },
      { status: 500 }
    );
  }
} 