'use client';

import { useEffect, useMemo, useState } from 'react';
import NavBar from '@/components/NavBar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import AuthModal from '@/components/AuthModal';
import { createAuthClient } from 'better-auth/react';

const { useSession } = createAuthClient();

interface LeaderboardEntry {
  userId: string;
  username: string;
  pnl: number;
  volume: number;
  trades: number;
  winRate: number;
}

const usd = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const currentId = session?.user?.id;
  const [authOpen, setAuthOpen] = useState(false);
  const [raw, setRaw] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) setRaw(data.portfolios as LeaderboardEntry[]);
    })();
  }, []);

  const topTen = useMemo(
    () =>
      raw
        .sort((a, b) => b.pnl - a.pnl)
        .slice(0, 10)
        .map((entry, i) => ({ rank: i + 1, ...entry })),
    [raw]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onAuthChange={setAuthOpen} />

      <main className="max-w-4xl mx-auto w-full p-4 flex-1">
        <Card className="rounded-xs shadow-lg">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto min-w-[max-content] text-xs md:text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-muted-foreground/40">
                    <th className="px-2 py-1 text-left whitespace-nowrap">Rank</th>
                    <th className="px-2 py-1 text-left whitespace-nowrap">User</th>
                    <th className="px-2 py-1 text-right whitespace-nowrap">PnL</th>
                    <th className="px-2 py-1 text-right whitespace-nowrap">Volume</th>
                    <th className="px-2 py-1 text-right whitespace-nowrap">Trades</th>
                    <th className="px-2 py-1 text-right whitespace-nowrap">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topTen.map((entry) => {
                    const highlight = entry.userId === currentId;
                    return (
                      <tr
                        key={entry.userId}
                        className={highlight ? 'bg-muted' : ''}
                      >
                        <td className="px-2 py-3 whitespace-nowrap">{entry.rank}</td>
                        <td className="px-2 py-3 whitespace-nowrap truncate">
                          {entry.username}
                        </td>
                        <td
                          className={`px-2 py-3 text-right whitespace-nowrap ${
                            entry.pnl > 0
                              ? 'text-green-600'
                              : entry.pnl < 0
                              ? 'text-red-600'
                              : ''
                          }`}
                        >
                          {usd(entry.pnl)}
                        </td>
                        <td className="px-2 py-3 text-right whitespace-nowrap">
                          {usd(entry.volume)}
                        </td>
                        <td className="px-2 py-3 text-right whitespace-nowrap">
                          {entry.trades}
                        </td>
                        <td className="px-2 py-3 text-right whitespace-nowrap">
                          {entry.winRate.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
