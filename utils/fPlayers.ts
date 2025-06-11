import prisma from "@/lib/prisma"

async function fetchPlayers() {
    try {
        // Get all players with basic info
        const players = await prisma.player.findMany({
            select: {
                Player_ID: true,
                Player_name: true,
                Playerpoint: true,
                Level_Id: true
            },
            orderBy: {
                Playerpoint: 'desc'
            }
        });

        return players;

    } catch (e) {
        console.error('Error fetching players:', e);
        return [];
    }
}

export default fetchPlayers;