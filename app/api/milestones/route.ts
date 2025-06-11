import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const milestones = await prisma.milestone.findMany({
      orderBy: {
        UnlockingLevel: 'asc'
      }
    });

    // Transform milestones into ranges
    const milestoneRanges = milestones.map((milestone, index, array) => {
      const startLevel = milestone.UnlockingLevel;
      const endLevel = array[index + 1]?.UnlockingLevel 
        ? array[index + 1].UnlockingLevel - 1 
        : startLevel + 9; // Last milestone covers 10 levels

      return {
        id: milestone.Milestone_Id,
        title: milestone.Milestone_Title,
        description: milestone.Milestone_description,
        range: [startLevel, endLevel],
        reward_message: milestone.Milestone_reward_message,
        button_cta: milestone.Milestone_Button_CTA,
        link: milestone.Milestone_Link
      };
    });

    return NextResponse.json({ milestones: milestoneRanges });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
} 