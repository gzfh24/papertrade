import { NextResponse } from "next/server";
import Portfolio from "@/lib/models/Portfolio";
import { initDB, requireUser, getMarkPrice } from "@/lib/helpers";
import { openTradeSchema } from "@/lib/validate";

const YAHOO_MAP: Record<string, string> = {
  BTCUSD: 'BTC-USD',
  XAUUSD: 'GC=F',   // gold futures
  SPXUSD: '^GSPC',  // S&P 500 index
  NDXUSD: '^NDX',   // Nasdaq‑100
};

// get open trades
export async function GET() {
  await initDB();
  const userId = await requireUser();

  const portfolio = await Portfolio.findOne({ userId }, "positions balance");
  const open = portfolio?.positions.filter((p: any) => p.isOpen) ?? [];

  return NextResponse.json({
    balance: portfolio?.balance ?? 0,
    positions: open,
  });
}

// open a new trade
export async function POST(req: Request) {
  await initDB();
  const userId = await requireUser();

  const payload = await req.json();
  const parsed = openTradeSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { symbol, margin, isLong, leverage } = parsed.data;

  if (!YAHOO_MAP[symbol])
    return NextResponse.json(
      { error: 'Unsupported symbol' },
      { status: 400 }
    );

  const entryPrice = await getMarkPrice(YAHOO_MAP[symbol]);
  const size = +(margin * leverage / entryPrice).toFixed(8);

  let base = await Portfolio.findOne({ userId });
  if (!base) base = await Portfolio.create({ userId });

  const portfolio = await Portfolio.findOneAndUpdate(
    { _id: base._id, balance: { $gte: margin } }, // ensure sufficient balance
    {
      $inc: { balance: -margin },
      $push: {
        positions: {
          symbol,
          margin,
          size,
          entryPrice,
          isLong,
          leverage,
          openedAt: new Date(),
          isOpen: true,
        },
      },
    },
    { new: true },
  );

  if (!portfolio) {
    return NextResponse.json(
      { message: "Insufficient balance for margin requirement" },
      { status: 400 },
    );
  }

  return NextResponse.json({ balance: portfolio.balance });
}
