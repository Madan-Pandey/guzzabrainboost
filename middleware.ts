import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    // Get player level from cookie
    const playerLevelCookie = req.cookies.get('PlayerLevel')?.value;
    const playerLevel = playerLevelCookie ? Number(playerLevelCookie) : 1;
    const isLoggedIn = req.cookies.get('LoggedIn')?.value === 'true';

    // Check if this is a quiz level request
    const levelMatch = req.nextUrl.pathname.match(/^\/quiz\/(\d+)$/);

    if (levelMatch) {
        const requestedLevel = Number(levelMatch[1]);
        
        // Only validate level number range
        if (isNaN(requestedLevel) || requestedLevel < 1 || requestedLevel > 50) {
            return NextResponse.redirect(new URL("/quiz/1", req.url));
        }

        // Allow access to all levels
        return NextResponse.next();
    }

    // Handle other routes
    if (req.nextUrl.pathname === "/quiz") {
        // Go to quiz page with why play section
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/quiz/:path*"]
}; 