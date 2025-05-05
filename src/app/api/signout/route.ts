import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await auth.api.signOut(
            { headers: req.headers },
        );
        return NextResponse.redirect(new URL("/trade", req.url), 302);
    } catch (error) {
        console.error("Signout error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}