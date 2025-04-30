import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { headers } from "next/headers"
import yahooFinance from 'yahoo-finance2';

export async function requireUser() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.id) {
        throw NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return session.user.id as string;
}

export async function initDB() {
    await dbConnect();
}

export async function getMarkPrice(symbol: string) {
    try {
        const result = await yahooFinance.quote(symbol);
        if (!result || !result.regularMarketPrice) {
            throw new Error("Invalid response from Yahoo Finance");
        }
        return result.regularMarketPrice;
    } catch (error) {
        console.error("Error fetching market price:", error);
        throw new Error("Failed to fetch market price");
    }
}