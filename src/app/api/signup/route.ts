// app/api/signup/route.ts
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import Portfolio from "@/lib/models/Portfolio";
import { initDB } from "@/lib/helpers";

export async function POST(req: NextRequest) {
    try {
        const { email, password, username } = await req.json();

        if (!email || !password || !username) {
            return NextResponse.json(
                { error: "Email, password, and username are required" },
                { status: 400 }
            );
        }

        const { response } = await auth.api.signUpEmail({
            returnHeaders: true,
            body: {
                email,
                password,
                name: username
            }
        });

        if (!response?.user) {
            return NextResponse.json(
                { error: "Signup failed" },
                { status: 400 }
            );
        }
        
        await initDB();
        Portfolio.create({ userId: response.user.id })

        return NextResponse.json(
            { message: "Signup successful", user: response.user },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}