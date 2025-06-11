'use server';

import prisma from "@/lib/prisma";
import { getCookie, setCookie } from "cookies-next";
import { PlayerType } from '@/types/types';

const fetchUser = async (userid: number, username: string, email: string): Promise<PlayerType> => {
  try {
    const playerexist = await prisma.player.findFirst({
      where: {
        Player_ID: userid,
      }
    });

    if (playerexist) {
      // checking and updating streak
      const lastLoginDate = new Date(playerexist.lastLogin || new Date());
      lastLoginDate.setHours(0, 0, 0, 0);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const dayDiff =
        (currentDate.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24); // Convert milliseconds to days

      let updatedStreak = playerexist.streak || 0;

      if (dayDiff === 1) {
        updatedStreak += 1; // Increment streak if last login was exactly 1 day ago
      } else if (dayDiff > 1) {
        updatedStreak = 1; // Reset streak if more than 1 day has passed
      }

      // Get tempScore from cookies-next instead of next/headers
      const tempScore = getCookie('tempScore') || '0';
      const totalScore = Number(playerexist.Playerpoint || 0) + Number(tempScore);

      const player = await prisma.player.update({
        where: {
          Player_ID: userid,
        },
        data: {
          Player_name: username,
          email: email,
          streak: updatedStreak,
          lastLogin: currentDate,
          Playerpoint: totalScore,
        }
      });

      setCookie("tempScore", "0");

      return {
        Player_ID: player.Player_ID,
        Player_name: player.Player_name || username,
        email: player.email || email,
        Playerpoint: player.Playerpoint || 0,
        Level_Id: player.Level_Id || 1,
        streak: player.streak || undefined,
        lastLogin: player.lastLogin || undefined,
        created_at: player.created_at || undefined
      };
    }

    // Check if level 1 exists, if not create it
    const level1 = await prisma.level.findFirst({
      where: { Level_Id: 1 }
    });

    if (!level1) {
      await prisma.level.create({
        data: {
          Level_Id: 1,
          Level_Title: 'Getting Started',
          Level_number: 1
        }
      });
    }

    // Create new player
    const player = await prisma.player.create({
      data: {
        Player_ID: Number(userid),
        Player_name: username,
        email: email,
        Playerpoint: 0,
        Level_Id: 1,
        lastLogin: new Date(),
        streak: 1,
        created_at: new Date()
      }
    });

    // Create initial level score for level 1
    await prisma.levelScore.create({
      data: {
        player_id: player.Player_ID,
        level_number: 1,
        highest_score: 0,
        latest_score: 0,
        completion_percentage: 0,
        stars: 0
      }
    });

    return {
      Player_ID: player.Player_ID,
      Player_name: player.Player_name || username,
      email: player.email || email,
      Playerpoint: player.Playerpoint || 0,
      Level_Id: player.Level_Id || 1,
      streak: player.streak || undefined,
      lastLogin: player.lastLogin || undefined,
      created_at: player.created_at || undefined
    };
  } catch (error) {
    console.error('Error in fetchUser:', error);
    throw error;
  }
};

export default fetchUser;
