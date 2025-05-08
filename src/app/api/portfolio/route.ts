import { NextResponse } from 'next/server';

import Portfolio from '@/lib/models/Portfolio';
import { initDB, requireUser } from '@/lib/helpers';

export async function GET() {
  await initDB();
  const userId = await requireUser();

  const portfolio =
    (await Portfolio.findOne({ userId })) ||
    (await Portfolio.create({ userId }));

  return NextResponse.json({
    balance: portfolio.balance,
    positions: portfolio.positions ?? [],
  });
}
