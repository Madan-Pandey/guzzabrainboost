import prisma from "@/lib/prisma"

export type Level = {
    Level_Id: number;
    Level_Title: string;
    Level_number: number;
};

const fetchLevels = async (): Promise<Level[]> => {
    try {
        const levels = await prisma.level.findMany({
            select: {
                Level_Id: true,
                Level_Title: true,
                Level_number: true,
            },
            orderBy: {
                Level_number: 'asc',
            },
        });
        return levels;
    } catch (error) {
        console.error('Error fetching levels:', error);
        return [];
    }
};

export default fetchLevels