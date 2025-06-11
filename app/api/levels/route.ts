import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const levels = await prisma.level.findMany({
            orderBy: {
                Level_Id: 'asc'
            }
        });

        return NextResponse.json(levels, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
    } catch (error) {
        console.error('Error fetching levels:', error);
        return NextResponse.json(
            { error: "Failed to fetch levels" },
            { status: 500 }
        );
    }
} 