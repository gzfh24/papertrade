// components/Trades.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createAuthClient } from 'better-auth/react';

const { useSession } = createAuthClient();

/* ─ helpers ─ */
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

/* ─ row component ─ */
function OpenRow({
  t,
  mark,
  onClose,
}: {
  t: Trade;
  mark: number;
  onClose: (id: string) => void;
}) {
  const posValue = t.size * mark;
  const pnl =
    (t.isLong ? mark - t.entryPrice : t.entryPrice - mark) * t.size;
  const pnlColor = pnl > 0 ? 'text-green-600' : pnl < 0 ? 'text-red-600' : '';

  return (
    <div className="grid grid-cols-11 gap-2 items-center py-2 text-xs md:text-sm">
      <span>{t.symbol}</span>
      <Badge
        variant={t.isLong ? 'default' : 'destructive'}
        className={
          t.isLong
            ? 'col-span-1 justify-center bg-green-600/20 text-green-700'
            : 'col-span-1 justify-center'
        }
      >
        {t.isLong ? 'Long' : 'Short'}
      </Badge>
      <span className="text-right">{t.leverage}×</span>
      <span className="text-right tabular-nums">{t.size.toFixed(4)}</span>
      <span className="text-right tabular-nums">{usd(posValue)}</span>
      <span className="text-right">{usd(t.entryPrice)}</span>
      <span className="text-right">{usd(mark)}</span>
      <span className={`text-right ${pnlColor}`}>{usd(pnl)}</span>
      <span className="text-right">{usd(liq(t.entryPrice, t.isLong, t.leverage))}</span>
      <span className="text-right">{usd(t.margin + pnl)}</span>
      <button
        onClick={() => onClose(t._id)}
        className="text-right underline hover:opacity-70"
      >
        Close
      </button>
    </div>
  );
}

/* ─ main component ─ */
export default function Trades() {
  const [openTrades, setOpenTrades] = useState<Trade[]>([]);
  const [marks, setMarks] = useState<Record<Asset, number>>({
    BTCUSD: 0,
    XAUUSD: 0,
    SPXUSD: 0,
    NDXUSD: 0,
  });

  const { data: session } = useSession();

  /* prices poll */
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

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 5_000);
    return () => clearInterval(id);
  }, [fetchPrices]);

  /* open positions */
  const fetchOpen = useCallback(async () => {
    const res = await fetch('/api/trade/open', { cache: 'no-store' });
    const data = await res.json();
    if (res.ok) setOpenTrades(data.positions as Trade[]);
  }, []);

  useEffect(() => {
    if (session?.user?.id) fetchOpen();
    fetchPrices();
  }, [fetchOpen, fetchPrices]);

  /* refresh after trade event */
  useEffect(() => {
    const h = () => {
      fetchOpen();
      fetchPrices();
    };
    window.addEventListener('trade:placed', h);
    window.addEventListener('auth:success', h);
    return () => {
      window.removeEventListener('trade:placed', h);
      window.removeEventListener('auth:success', h);
    };
  }, [fetchOpen, fetchPrices]);

  /* close */
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

  /* ui */
  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle>Open Trades</CardTitle>
      </CardHeader>

      <CardContent>
        {/* header */}
        <div className="hidden md:grid grid-cols-11 gap-2 text-xs font-medium text-muted-foreground px-1">
          <span>Asset</span>
          <span>Direction</span>
          <span className="text-right">Lev</span>
          <span className="text-right">Size</span>
          <span className="text-right">Pos Value</span>
          <span className="text-right">Entry</span>
          <span className="text-right">Mark</span>
          <span className="text-right">PnL</span>
          <span className="text-right">Liq Price</span>
          <span className="text-right">Margin</span>
          <span className="text-right">Close</span>
        </div>
        <Separator className="mb-2" />

        {/* rows */}
        {openTrades.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No open trades
          </p>
        ) : (
          openTrades.map((t) => (
            <OpenRow key={t._id} t={t} mark={marks[t.symbol]} onClose={closeTrade} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
