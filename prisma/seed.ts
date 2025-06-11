import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create all 50 levels
  const levels = Array.from({ length: 50 }, (_, i) => {
    const levelNumber = i + 1;
    let levelTitle = '';

    // Assign appropriate titles based on level ranges
    if (levelNumber <= 10) {
      levelTitle = `Beginner Level ${levelNumber}`;
    } else if (levelNumber <= 20) {
      levelTitle = `Elementary Level ${levelNumber}`;
    } else if (levelNumber <= 30) {
      levelTitle = `Intermediate Level ${levelNumber}`;
    } else if (levelNumber <= 40) {
      levelTitle = `Advanced Level ${levelNumber}`;
    } else {
      levelTitle = `Expert Level ${levelNumber}`;
    }

    return {
      Level_Title: levelTitle,
      Level_number: levelNumber
    };
  });

  for (const level of levels) {
    await prisma.level.upsert({
      where: { Level_Id: level.Level_number },
      update: level,
      create: level,
    });
  }

  // Create initial milestones
  const milestones = [
    {
      Milestone_Id: 1,
      Milestone_Title: 'Beginner',
      Milestone_description: 'Complete your first quiz',
      UnlockingLevel: 1,
      Milestone_reward_message: 'Congratulations on starting your journey!',
      Milestone_Link: '/rewards/beginner',
      Milestone_Button_CTA: 'Claim Reward'
    },
    {
      Milestone_Id: 2,
      Milestone_Title: 'Elementary',
      Milestone_description: 'Complete 10 quizzes',
      UnlockingLevel: 10,
      Milestone_reward_message: 'You\'re making great progress!',
      Milestone_Link: '/rewards/elementary',
      Milestone_Button_CTA: 'Claim Reward'
    },
    {
      Milestone_Id: 3,
      Milestone_Title: 'Intermediate',
      Milestone_description: 'Complete 25 quizzes',
      UnlockingLevel: 25,
      Milestone_reward_message: 'You\'re becoming a quiz master!',
      Milestone_Link: '/rewards/intermediate',
      Milestone_Button_CTA: 'Claim Reward'
    },
    {
      Milestone_Id: 4,
      Milestone_Title: 'Advanced',
      Milestone_description: 'Complete 40 quizzes',
      UnlockingLevel: 40,
      Milestone_reward_message: 'You\'re almost at expert level!',
      Milestone_Link: '/rewards/advanced',
      Milestone_Button_CTA: 'Claim Reward'
    },
    {
      Milestone_Id: 5,
      Milestone_Title: 'Expert',
      Milestone_description: 'Complete all 50 quizzes',
      UnlockingLevel: 50,
      Milestone_reward_message: 'You\'ve mastered all the quizzes!',
      Milestone_Link: '/rewards/expert',
      Milestone_Button_CTA: 'Claim Reward'
    }
  ];

  for (const milestone of milestones) {
    await prisma.milestone.upsert({
      where: { Milestone_Id: milestone.Milestone_Id },
      update: milestone,
      create: milestone,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 