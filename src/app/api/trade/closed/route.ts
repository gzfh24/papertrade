import { NextResponse } from "next/server";
import Portfolio from "@/lib/models/Portfolio";
import { initDB, requireUser } from "@/lib/helpers";

export async function GET() {
  await initDB();
  const userId = await requireUser();

  const portfolio = await Portfolio.findOne({ userId }, "positions");
  const closed = portfolio?.positions.filter((p: any) => !p.isOpen) ?? [];

  return NextResponse.json({ positions: closed });
}
