import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await auth.api.signOut(
            { headers: req.headers },
        );
        return NextResponse.json({ message: "Signed out successfully" }, { status: 200 });
    } catch (error) {
        console.error("Signout error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}