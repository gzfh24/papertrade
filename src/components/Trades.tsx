'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createAuthClient } from 'better-auth/react';

const { useSession } = createAuthClient();

type Asset = 'BTCUSD' | 'XAUUSD' | 'SPXUSD' | 'NDXUSD';
const SYMBOLS: Asset[] = ['BTCUSD', 'XAUUSD', 'SPXUSD', 'NDXUSD'];

interface Trade {
  _id: string;
  symbol: Asset;
  size: number;
  margin: number;
  entryPrice: number;
  isLong: boolean;
  leverage: number;
  openedAt: string;
  closePrice?: number;
  profit?: number;
}

const usd = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const liq = (entry: number, long: boolean, lev: number) => {
  const d = entry / lev;
  return long ? entry - d : entry + d;
};

export default function Trades() {
  const [openTrades, setOpenTrades] = useState<Trade[]>([]);
  const [marks, setMarks] = useState<Record<Asset, number>>({
    BTCUSD: 0,
    XAUUSD: 0,
    SPXUSD: 0,
    NDXUSD: 0,
  });
  const { data: session } = useSession();

  const fetchPrices = useCallback(async () => {
    const obj: Record<Asset, number> = { BTCUSD: 0, XAUUSD: 0, SPXUSD: 0, NDXUSD: 0 };
    await Promise.all(
      SYMBOLS.map(async (s) => {
        const res = await fetch(`/api/prices?symbol=${s}`, { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && data.price) obj[s] = data.price;
      })
    );
    setMarks(obj);
  }, []);

  const fetchOpen = useCallback(async () => {
    const res = await fetch('/api/trade/open', { cache: 'no-store' });
    const data = await res.json();
    if (res.ok) setOpenTrades(data.positions as Trade[]);
  }, []);

  useEffect(() => {
    fetchPrices();
    const iv = setInterval(fetchPrices, 5000);
    return () => clearInterval(iv);
  }, [fetchPrices]);

  useEffect(() => {
    if (session?.user?.id) fetchOpen();
  }, [session?.user?.id, fetchOpen]);

  useEffect(() => {
    const handler = () => {
      fetchOpen();
      fetchPrices();
    };
    window.addEventListener('trade:placed', handler);
    window.addEventListener('auth:success', handler);
    return () => {
      window.removeEventListener('trade:placed', handler);
      window.removeEventListener('auth:success', handler);
    };
  }, [fetchOpen, fetchPrices]);

  const closeTrade = async (id: string) => {
    const res = await fetch(`/api/trade/close/${id}`, { method: 'POST' });
    if (res.ok) {
      toast.success('Trade closed');
      window.dispatchEvent(new Event('trade:placed'));
    } else {
      const { message } = await res.json();
      toast.error(message || 'Failed to close trade');
    }
  };

  return (
    <Card className="shadow-lg rounded-xs">
      <CardHeader>
        <CardTitle>Open Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full table-auto min-w-[max-content] text-xs md:text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b border-muted-foreground/40">
                <th className="px-2 py-1 text-left whitespace-nowrap">Asset</th>
                <th className="px-2 py-1 text-left whitespace-nowrap">Direction</th>
                <th className="px-2 py-1 text-right whitespace-nowrap">Leverage</th>
                <th className="px-2 py-1 text-right whitespace-nowrap">Size</th>
                <th className="px-2 py-1 text-right whitespace-nowrap">Value</th>
                <th className="px-2 py-1 text-right whitespace-nowrap">Entry</th>
                <th className="px-2 py-1 text-right whitespace-nowrap">Mark</th>
                <th className="px-2 py-1 text-right whitespace-nowrap">PnL</th>
                <th className="px-2 py-1 text-right whitespace-nowrap">Liq Price</th>
                <th className="px-2 py-1 text-right whitespace-nowrap">Margin</th>
                <th className="px-2 py-1 text-right whitespace-nowrap">Close</th>
              </tr>
            </thead>
            <tbody>
              {openTrades.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-muted-foreground">
                    No open trades
                  </td>
                </tr>
              ) : (
                openTrades.map((t) => {
                  const mark = marks[t.symbol];
                  const posValue = t.size * mark;
                  const pnl =
                    (t.isLong ? mark - t.entryPrice : t.entryPrice - mark) * t.size;
                  const pnlColor = pnl > 0 ? 'text-green-600' : pnl < 0 ? 'text-red-600' : '';
                  return (
                    <tr key={t._id}>
                      <td className="px-2 py-3 whitespace-nowrap">{t.symbol}</td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <Badge
                          variant={t.isLong ? 'default' : 'destructive'}
                          className={
                            t.isLong
                              ? 'bg-green-600/20 text-green-700 px-1'
                              : 'px-1'
                          }
                        >
                          {t.isLong ? 'Long' : 'Short'}
                        </Badge>
                      </td>
                      <td className="px-2 py-3 text-right whitespace-nowrap">
                        {t.leverage}×
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums whitespace-nowrap">
                        {t.size.toFixed(4)}
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums whitespace-nowrap">
                        {usd(posValue)}
                      </td>
                      <td className="px-2 py-3 text-right whitespace-nowrap">
                        {usd(t.entryPrice)}
                      </td>
                      <td className="px-2 py-3 text-right whitespace-nowrap">
                        {usd(mark)}
                      </td>
                      <td className={`px-2 py-3 text-right whitespace-nowrap ${pnlColor}`}>
                        {usd(pnl)}
                      </td>
                      <td className="px-2 py-3 text-right whitespace-nowrap">
                        {usd(liq(t.entryPrice, t.isLong, t.leverage))}
                      </td>
                      <td className="px-2 py-3 text-right whitespace-nowrap">
                        {usd(t.margin + pnl)}
                      </td>
                      <td className="px-2 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => closeTrade(t._id)}
                          className="underline hover:opacity-70"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
