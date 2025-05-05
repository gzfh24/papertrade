// app/api/portfolio/route.ts
import { NextResponse } from 'next/server';

import Portfolio from '@/lib/models/Portfolio';
import { initDB, requireUser } from '@/lib/helpers';

export async function GET() {
  await initDB();

  // Better‑Auth helper that throws 401 if there is no logged‑in user
  const userId = await requireUser();

  // look up portfolio; create one on the fly if it doesn't exist
  const portfolio =
    (await Portfolio.findOne({ userId })) ||
    (await Portfolio.create({ userId }));

  return NextResponse.json({
    balance: portfolio.balance,
    positions: portfolio.positions ?? [],
  });
}
