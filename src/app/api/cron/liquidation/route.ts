import { NextResponse } from 'next/server';
import { initDB, getMarkPrice } from '@/lib/helpers';
import Portfolio from '@/lib/models/Portfolio';

type Asset = 'BTCUSD' | 'XAUUSD' | 'SPXUSD' | 'NDXUSD';
const YAHOO_MAP: Record<Asset, string> = {
  BTCUSD: 'BTC-USD',
  XAUUSD: 'GC=F',
  SPXUSD: '^GSPC',
  NDXUSD: '^NDX',
};

export const revalidate = 0; // never cache

export async function GET() {
  await initDB();

  // get all open positions
  const portfolios = await Portfolio.find(
    { 'positions.isOpen': true },
    'userId balance positions'
  ).lean();

  if (portfolios.length === 0)
    return NextResponse.json({ checked: 0, liquidated: 0 });

  // get mark prices
  const symbols = new Set<Asset>();
  portfolios.forEach((p) =>
    p.positions.forEach((pos: any) => symbols.add(pos.symbol))
  );

  const marks: Partial<Record<Asset, number>> = {};
  await Promise.all(
    [...symbols].map(async (s) => {
      marks[s] = await getMarkPrice(YAHOO_MAP[s]);
    })
  );

  // check for liquidations
  let liquidated = 0;

  for (const p of portfolios) {
    let balanceDelta = 0;

    p.positions.forEach((pos: any) => {
      if (!pos.isOpen) return;

      const mark = marks[pos.symbol as Asset];
      if (mark === undefined) return;

      const pnl =
        (pos.isLong ? mark - pos.entryPrice : pos.entryPrice - mark) *
        pos.size;

      if (pnl <= -pos.margin) {
        // close the position
        pos.isOpen = false;
        pos.closedAt = new Date();
        pos.closePrice = mark;
        pos.profit = pnl;

        balanceDelta += pnl + pos.margin;
        liquidated += 1;
      }
    });

    if (balanceDelta !== 0) {
      await Portfolio.updateOne(
        { _id: p._id },
        { $set: { positions: p.positions }, $inc: { balance: balanceDelta } }
      );
    }
  }

  return NextResponse.json({
    checked: portfolios.length,
    liquidated,
    runAt: new Date().toISOString(),
  });
}
