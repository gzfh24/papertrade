import { NextRequest, NextResponse } from "next/server";
import Portfolio from "@/lib/models/Portfolio";
import { initDB, requireUser, getMarkPrice } from "@/lib/helpers";

const YAHOO_MAP: Record<string, string> = {
  BTCUSD: 'BTC-USD',
  XAUUSD: 'GC=F',   // gold futures
  SPXUSD: '^GSPC',  // S&P 500 index
  NDXUSD: '^NDX',   // Nasdaq‑100
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDB();
  const userId = await requireUser();

  // 1. locate portfolio
  const portfolio = await Portfolio.findOne({ userId });
  if (!portfolio)
    return NextResponse.json({ message: "Portfolio not found" }, { status: 404 });

  const { id } = await params;
  const trade = portfolio.positions.id(id);
  if (!trade || !trade.isOpen)
    return NextResponse.json(
      { message: "Trade not found or already closed" },
      { status: 404 }
    );

  // 2. fetch current mark-price for the trade’s symbol
  const closePrice = await getMarkPrice(YAHOO_MAP[trade.symbol]);
  if (closePrice == null)
    return NextResponse.json(
      { message: "Unable to fetch mark price" },
      { status: 502 }
    );

  // 3. PnL calculation
  const pnl =
    (trade.isLong
      ? closePrice - trade.entryPrice
      : trade.entryPrice - closePrice) * trade.size;

  // 4. mutate embedded doc + balance
  trade.isOpen = false;
  trade.closedAt = new Date();
  trade.closePrice = closePrice;
  trade.profit = pnl;

  portfolio.balance += pnl + Number(trade.margin);
  await portfolio.save();

  return NextResponse.json({
    balance: portfolio.balance,
    profit: pnl,
    closePrice,
  });
}