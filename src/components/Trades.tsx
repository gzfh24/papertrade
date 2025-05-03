'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

/* ────────────── helpers ────────────── */
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
  closedAt?: string;
  closePrice?: number;
  profit?: number;
}

const formatUSD = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const calcLiq = (entry: number, isLong: boolean, lev: number) => {
  const dist = entry / lev;
  return isLong ? entry - dist : entry + dist;
};

/* ────────────── row components ────────────── */
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
      <span className="text-right tabular-nums">
        {t.size.toFixed(4)}
      </span>
      <span className="text-right tabular-nums">
        {formatUSD(posValue)}
      </span>
      <span className="text-right">{formatUSD(t.entryPrice)}</span>
      <span className="text-right">{formatUSD(mark)}</span>
      <span className={`text-right ${pnlColor}`}>{formatUSD(pnl)}</span>
      <span className="text-right">
        {formatUSD(calcLiq(t.entryPrice, t.isLong, t.leverage))}
      </span>
      <span className="text-right">{formatUSD(t.margin + pnl)}</span>
      <button
        onClick={() => onClose(t._id)}
        className="text-right underline hover:opacity-70"
      >
        Close
      </button>
    </div>
  );
}

function ClosedRow({ t }: { t: Trade }) {
  const pnl = t.profit ?? 0;
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
      <span className="text-right tabular-nums">
        {t.size.toFixed(4)}
      </span>
      <span className="text-right tabular-nums">
        {formatUSD((t.size * (t.closePrice ?? 0)) || 0)}
      </span>
      <span className="text-right">{formatUSD(t.entryPrice)}</span>
      <span className="text-right">{formatUSD(t.closePrice ?? 0)}</span>
      <span className={`text-right ${pnlColor}`}>{formatUSD(pnl)}</span>
      <span className="text-right">
        {new Date(t.closedAt ?? '').toLocaleDateString()}
      </span>
      <span className="text-right">{formatUSD(t.margin+pnl)}</span>
      <span /> {/* empty cell to maintain 11‑col grid */}
    </div>
  );
}

/* ────────────── main component ────────────── */
export default function Trades() {
  const [openTrades, setOpenTrades] = useState<Trade[]>([]);
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
  const [marks, setMarks] = useState<Record<Asset, number>>({
    BTCUSD: 0,
    XAUUSD: 0,
    SPXUSD: 0,
    NDXUSD: 0,
  });
  const [tab, setTab] = useState<'open' | 'history'>('open');

  /* ─ fetch helpers ─ */
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

  const fetchOpen = useCallback(async () => {
    const res = await fetch('/api/trade/open', { cache: 'no-store' });
    const data = await res.json();
    if (res.ok) setOpenTrades(data.positions as Trade[]);
  }, []);

  const fetchClosed = useCallback(async () => {
    const res = await fetch('/api/trade/closed', { cache: 'no-store' });
    const data = await res.json();
    if (res.ok) setClosedTrades(data.positions as Trade[]);
  }, []);

  /* initial fetch */
  useEffect(() => {
    fetchOpen();
    fetchClosed();
    fetchPrices();
  }, [fetchOpen, fetchClosed, fetchPrices]);

  /* refresh on trade events */
  useEffect(() => {
    const handler = () => {
      fetchOpen();
      fetchClosed();
      fetchPrices();
    };
    window.addEventListener('trade:placed', handler);
    return () => window.removeEventListener('trade:placed', handler);
  }, [fetchOpen, fetchClosed, fetchPrices]);

  /* close position */
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
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle>Your Trades</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="open" className="flex-1">
              Open
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              History
            </TabsTrigger>
          </TabsList>

          {/* header row */}
          <div className="hidden md:grid grid-cols-11 gap-2 text-xs font-medium text-muted-foreground px-1">
            <span>Asset</span>
            <span>Direction</span>
            <span className="text-right">Leverage</span>
            <span className="text-right">Size</span>
            <span className="text-right">Pos&nbsp;Value</span>
            <span className="text-right">Entry</span>
            <span className="text-right">Mark</span>
            <span className="text-right">PnL</span>
            <span className="text-right">Liq&nbsp;Price</span>
            <span className="text-right">Margin</span>
            {tab === 'open' && <span className="text-right">Close</span>}
          </div>
          <Separator className="mb-2" />

          {/* open trades */}
          <TabsContent value="open">
            {openTrades.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No open trades
              </p>
            ) : (
              openTrades.map((t) => (
                <OpenRow
                  key={t._id}
                  t={t}
                  mark={marks[t.symbol]}
                  onClose={closeTrade}
                />
              ))
            )}
          </TabsContent>

          {/* history trades */}
          <TabsContent value="history">
            {closedTrades.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No closed trades
              </p>
            ) : (
              closedTrades.map((t) => <ClosedRow key={t._id} t={t} />)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
