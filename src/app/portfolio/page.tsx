// app/portfolio/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns-tz';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';

import { createAuthClient } from 'better-auth/react';

const { useSession } = createAuthClient()

type Asset = 'BTCUSD' | 'XAUUSD' | 'SPXUSD' | 'NDXUSD';
interface Trade {
  _id: string;
  symbol: Asset;
  margin: number;
  leverage: number;
  size: number;
  entryPrice: number;
  closePrice: number;
  profit: number;
  isLong: boolean;
  closedAt: string;
}

const PAGE_SIZE = 10;
const tz = 'America/New_York';

export default function PortfolioPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const {
    data: session,
  } = useSession()

  // fetch closed trades
  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/trade');
    } else {
      (async () => {
        const res = await fetch('/api/trade/closed', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok) setTrades(data.positions as Trade[]);
      })();
    }
  }, []);

  // calculations useMemo to avoid re-calculating on every render
  const { volume, totalPnl, winRate } = useMemo(() => {
    const vol = trades.reduce(
      (acc, t) =>
        acc +
        (t.margin * t.leverage +
          (t.margin + (t.profit ?? 0)) * t.leverage),
      0
    );
    const pnl = trades.reduce((acc, t) => acc + (t.profit ?? 0), 0);
    const wins = trades.filter((t) => (t.profit ?? 0) > 0).length;
    const rate = trades.length ? (wins / trades.length) * 100 : 0;
    return { volume: vol, totalPnl: pnl, winRate: rate };
  }, [trades]);

  const lastPage = Math.max(1, Math.ceil(trades.length / PAGE_SIZE));
  const slice = trades.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fmt = (n: number) =>
    `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onAuthChange={() => {}}/>

      <main className="max-w-7xl mx-auto w-full p-4 space-y-6 flex-1">
        {/* top stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Volume" value={fmt(volume)} />
          <StatCard
            title="Total Profit"
            value={fmt(totalPnl)}
            valueColor={totalPnl > 0 ? 'text-green-600' : totalPnl < 0 ? 'text-red-600' : ''}
          />
          <StatCard title="Win Rate" value={`${winRate.toFixed(2)}%`} />
        </div>

        {/* closed trades table */}
        <Card>
          <CardHeader>
            <CardTitle>Closed Trades</CardTitle>
          </CardHeader>
          <CardContent>
            {/* header */}
            <div className="hidden md:grid grid-cols-9 gap-x-3 text-xs font-medium text-muted-foreground px-1">
              <span>Time</span>
              <span>Asset</span>
              <span>Direction</span>
              <span className="text-right">Margin</span>
              <span className="text-right">Leverage</span>
              <span className="text-right">Size</span>
              <span className="text-right">Entry</span>
              <span className="text-right">Close</span>
              <span className="text-right">PnL</span>
            </div>
            <Separator className="mb-2" />

            {/* rows */}
            {slice.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No closed trades
              </p>
            ) : (
              slice.map((t) => (
                <div
                  key={t._id}
                  className="grid grid-cols-9 gap-x-3 items-center py-2 text-xs md:text-sm"
                >
                  <span>
                    {format(new Date(t.closedAt), 'MM/dd/yyyy - HH:mm:ss', {
                      timeZone: tz,
                    })}
                  </span>
                  <span>{t.symbol}</span>
                  <span className={t.isLong ? 'text-green-600' : 'text-red-600'}>
                    {t.isLong ? 'Long' : 'Short'}
                  </span>
                  <span className="text-right">{fmt(t.margin)}</span>
                  <span className="text-right">{t.leverage}×</span>
                  <span className="text-right font-mono">
                    {t.size.toFixed(4)}
                  </span>
                  <span className="text-right">{fmt(t.entryPrice)}</span>
                  <span className="text-right">{fmt(t.closePrice)}</span>
                  <span
                    className={
                      t.profit && t.profit !== 0
                        ? t.profit > 0
                          ? 'text-green-600 text-right'
                          : 'text-red-600 text-right'
                        : 'text-right'
                    }
                  >
                    {fmt(t.profit ?? 0)}
                  </span>
                </div>
              ))
            )}

            {/* pages */}
            {trades.length > PAGE_SIZE && (
              <div className="flex justify-end mt-4 gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                >
                  First
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <span className="self-center text-sm">
                  Page {page} / {lastPage}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page === lastPage}
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                >
                  Next
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page === lastPage}
                  onClick={() => setPage(lastPage)}
                >
                  Last
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  valueColor = '',
}: {
  title: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
