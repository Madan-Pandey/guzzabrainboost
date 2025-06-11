import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        
            const cookieStore =  cookies()
            cookieStore.set('LoggedIn', 'false', { secure: true , httpOnly:true,sameSite:"strict", path:"/", })
            cookieStore.set('PlayerLevel', "", { secure: true , httpOnly:true,sameSite:"strict", path:"/", })

        
        return NextResponse.json({ message: "Logout Successful"}, { status: 200 });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "An error occurred during login" + error }, { status: 500 });
    }
}