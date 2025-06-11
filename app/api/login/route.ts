import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { memberId, email, firstName } = await req.json();

        if (!memberId || !email) {
            return NextResponse.json({ message: "Member ID and email are required" }, { status: 400 });
        }

        let player = await prisma.player.findFirst({
            where: {
                email: email,
            },
            include: {
                milestone: true,
                level: true
            }
        });

        if (!player) {
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

            // Check if milestone 1 exists, if not create it
            const milestone1 = await prisma.milestone.findFirst({
                where: { Milestone_Id: 1 }
            });

            if (!milestone1) {
                await prisma.milestone.create({
                    data: {
                        Milestone_Id: 1,
                        Milestone_Title: 'Beginner',
                        Milestone_description: 'Start your journey',
                        UnlockingLevel: 1,
                        Milestone_reward_message: 'Welcome to the quiz!',
                        Milestone_Link: '/rewards/beginner',
                        Milestone_Button_CTA: 'Start Quiz'
                    }
                });
            }

            // Create new player if they don't exist
            player = await prisma.player.create({
                data: {
                    Player_ID: Number(memberId),
                    email: email,
                    Player_name: firstName || "Anonymous",
                    Level_Id: 1,
                    Milestone_Id: 1,
                    Playerpoint: 0,
                    streak: 0,
                    lastLogin: new Date()
                },
                include: {
                    milestone: true,
                    level: true
                }
            });

            // Create initial level score for level 1
            await prisma.level_score.create({
                data: {
                    player_id: player.Player_ID,
                    level_number: 1,
                    highest_score: 0,
                    latest_score: 0,
                    completion_percentage: 0,
                    stars: 0
                }
            });
        }

        // Update cookies
        const cookieStore = cookies();
        cookieStore.set('LoggedIn', 'true', { 
            secure: process.env.NODE_ENV === 'production', 
            httpOnly: true, 
            sameSite: "lax", 
            path: "/",
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });
        cookieStore.set('PlayerLevel', String(player.Level_Id), { 
            secure: process.env.NODE_ENV === 'production', 
            httpOnly: true, 
            sameSite: "lax", 
            path: "/",
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });

        // Store player data in localStorage through response
        const response = NextResponse.json({ 
            message: "Login successful", 
            player: {
                Player_ID: player.Player_ID,
                Player_name: player.Player_name,
                email: player.email,
                Playerpoint: player.Playerpoint,
                Level_Id: player.Level_Id,
                Milestone_Id: player.Milestone_Id,
                lastLogin: player.lastLogin,
                streak: player.streak,
                milestone: player.milestone,
                level: player.level
            }
        }, { status: 200 });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "An error occurred during login: " + error }, { status: 500 });
    }
}