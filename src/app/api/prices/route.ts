import { NextResponse } from 'next/server';
import { getMarkPrice } from '@/lib/helpers';

/**
 * Internal → Yahoo Finance symbol map
 * (BTCUSD → "BTC-USD",   SPXUSD → "^GSPC", etc.)
 */
const YAHOO_MAP: Record<string, string> = {
  BTCUSD: 'BTC-USD',
  XAUUSD: 'GC=F',   // gold futures
  SPXUSD: '^GSPC',  // S&P 500 index
  NDXUSD: '^NDX',   // Nasdaq‑100
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol')?.toUpperCase();

  if (!symbol)
    return NextResponse.json(
      { error: 'Missing ?symbol= query param' },
      { status: 400 }
    );

  if (!YAHOO_MAP[symbol])
    return NextResponse.json(
      { error: 'Unsupported symbol' },
      { status: 400 }
    );

  try {
    const price = await getMarkPrice(YAHOO_MAP[symbol]);

    return NextResponse.json(
      { price },
      {
        // prevent edge/global caching
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 502 }
    );
  }
}
