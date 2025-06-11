import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { memberId, email, firstName } = await req.json();

        if (!memberId || !email) {
            return NextResponse.json({ message: "Member ID and email are required" }, { status: 400 });
        }

        // Check if player already exists
        const existingPlayer = await prisma.player.findFirst({
            where: {
                email: email,
            }
        });

        if (existingPlayer) {
            return NextResponse.json({ message: "Player already exists" }, { status: 400 });
        }

        // Create new player
        const player = await prisma.player.create({
            data: {
                email: email,
                Player_name: firstName || "Anonymous",
                Level_Id: 1,
                Playerpoint: 0,
                streak: 0
            }
        });

        return NextResponse.json({ message: "Player created successfully", player: player }, { status: 201 });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ message: "An error occurred during signup: " + error }, { status: 500 });
    }
}