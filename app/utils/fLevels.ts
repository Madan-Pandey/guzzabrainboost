import prisma from "@/lib/prisma";

export default async function fetchLevels() {
  try {
    // Fetch all levels without any limit
    const levels = await prisma.level.findMany({
      orderBy: {
        Level_number: 'asc'
      },
      select: {
        Level_Id: true,
        Level_Title: true,
        Level_number: true
      }
    });

    return levels;
  } catch (error) {
    console.error('Error fetching levels:', error);
    return [];
  }
} 