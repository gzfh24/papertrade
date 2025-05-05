// app/api/signin/route.ts
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const { response } = await auth.api.signInEmail({
            returnHeaders: true,
            body: {
                email,
                password,
            }
        });

        if (!response?.user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { message: "Signin successful", user: response.user },
            { status: 200 }
        );
    } catch (error) {
        console.error("Signin error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}