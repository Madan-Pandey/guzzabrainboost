
import prisma from "@/lib/prisma"

async function fetchMilestone() {
    try {
        const milestone = await prisma.milestone.findMany();
        return milestone

    } catch (e) {
        console.error(e)
    }
}

export default fetchMilestone