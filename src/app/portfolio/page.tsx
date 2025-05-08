'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns-tz';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';
import ConfirmResetModal from '@/components/ConfirmResetModal';
import StatCard from '@/components/StatCard';
import { useRouter } from 'next/navigation';
import { createAuthClient } from 'better-auth/react';

const { useSession } = createAuthClient();

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!session?.user?.id && !isPending) {
      router.push('/trade');
      return;
    }
    (async () => {
      const res = await fetch('/api/trade/closed', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) setTrades(data.positions as Trade[]);
    })();
  }, [session?.user?.id, isPending, router]);

  const { volume, totalPnl, winRate } = useMemo(() => {
    const vol = trades.reduce(
      (a, t) => a + t.margin * t.leverage + (t.margin + t.profit) * t.leverage,
      0
    );
    const pnl = trades.reduce((a, t) => a + t.profit, 0);
    const wins = trades.filter((t) => t.profit > 0).length;
    const rate = trades.length ? (wins / trades.length) * 100 : 0;
    return { volume: vol, totalPnl: pnl, winRate: rate };
  }, [trades]);

  const lastPage = Math.max(1, Math.ceil(trades.length / PAGE_SIZE));
  const slice = trades.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const fmt = (n: number) =>
    `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onAuthChange={() => {}} />

      <main className="max-w-7xl mx-auto w-full p-4 space-y-6 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Volume" value={fmt(volume)} />
          <StatCard
            title="Total Profit"
            value={fmt(totalPnl)}
            valueColor={
              totalPnl > 0 ? 'text-green-600' : totalPnl < 0 ? 'text-red-600' : ''
            }
          />
          <StatCard title="Win Rate" value={`${winRate.toFixed(2)}%`} />
        </div>

        <Card className="rounded-xs shadow-lg">
          <CardHeader>
            <CardTitle>Closed Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto min-w-[max-content] text-xs md:text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-muted-foreground/40">
                    <th className="px-2 py-1 text-left whitespace-nowrap">Time</th>
                    <th className="px-2 py-1 text-left whitespace-nowrap">Asset</th>
                    <th className="px-2 py-1 text-left whitespace-nowrap">Direction</th>
                    <th className="px-2 py-1 text-right whitespace-nowrap">Margin</th>
                    <th className="px-2 py-1 text-right whitespace-nowrap">Leverage</th>
                    <th className="px-2 py-1 text-right whitespace-nowrap">Size</th>
                    <th className="px-2 py-1 text-right whitespace-nowrap">Entry</th>
                    <th className="px-2 py-1 text-right whitespace-nowrap">Close</th>
                    <th className="px-2 py-1 text-right whitespace-nowrap">PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground">
                        No closed trades
                      </td>
                    </tr>
                  ) : (
                    slice.map((t) => (
                      <tr key={t._id}>
                        <td className="px-2 py-3 whitespace-nowrap">
                          {format(new Date(t.closedAt), 'MM/dd/yyyy - HH:mm:ss', {
                            timeZone: tz,
                          })}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">{t.symbol}</td>
                        <td
                          className={`px-2 py-3 whitespace-nowrap ${
                            t.isLong ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {t.isLong ? 'Long' : 'Short'}
                        </td>
                        <td className="px-2 py-3 text-right whitespace-nowrap">
                          {fmt(t.margin)}
                        </td>
                        <td className="px-2 py-3 text-right whitespace-nowrap">
                          {t.leverage}×
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums whitespace-nowrap">
                          {t.size.toFixed(4)}
                        </td>
                        <td className="px-2 py-3 text-right whitespace-nowrap">
                          {fmt(t.entryPrice)}
                        </td>
                        <td className="px-2 py-3 text-right whitespace-nowrap">
                          {fmt(t.closePrice)}
                        </td>
                        <td
                          className={`px-2 py-3 text-right whitespace-nowrap ${
                            t.profit > 0
                              ? 'text-green-600'
                              : t.profit < 0
                              ? 'text-red-600'
                              : ''
                          }`}
                        >
                          {fmt(t.profit)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

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
                  onClick={() => setPage((p) => p - 1)}
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
                  onClick={() => setPage((p) => p + 1)}
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

            <Button
              variant="destructive"
              className="mt-6 ml-auto block"
              onClick={() => setConfirmOpen(true)}
            >
              Restart
            </Button>
          </CardContent>
        </Card>
      </main>

      <ConfirmResetModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={async () => {
          await fetch('/api/portfolio', { method: 'DELETE', credentials: 'include' });
          window.location.reload();
        }}
      />
    </div>
  );
}
