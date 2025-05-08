// app/leaderboard/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import NavBar from '@/components/NavBar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { createAuthClient } from 'better-auth/react';
import AuthModal from '@/components/AuthModal';

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

  const topTen = useMemo(() => {
    console.log('raw', raw);
    return raw
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 10)
      .map((entry, i) => ({ rank: i + 1, ...entry }));
  }, [raw]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onAuthChange={setAuthOpen}/>

      <main className="max-w-4xl mx-auto w-full p-4 space-y-6 flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            {/* header */}
            <div className="hidden md:grid grid-cols-6 gap-x-4 text-xs font-medium text-muted-foreground px-1">
              <span>Rank</span>
              <span>User</span>
              <span className="text-right">PnL</span>
              <span className="text-right">Volume</span>
              <span className="text-right">Trades</span>
              <span className="text-right">Win Rate</span>
            </div>
            <Separator className="mb-2" />

            {topTen.map((entry) => {
              const highlight = entry.userId === currentId;
              return (
                <div
                  key={entry.username}
                  className={`grid grid-cols-6 gap-x-4 items-center py-2 text-sm ${
                    highlight ? 'bg-muted/60 rounded-md' : ''
                  }`}
                >
                  <span>{entry.rank}</span>
                  <span className="truncate">{entry.username.slice(0, 12)}</span>
                  <span
                    className={`text-right ${
                      entry.pnl > 0 ? 'text-green-600' : entry.pnl < 0 ? 'text-red-600' : ''
                    }`}
                  >
                    {usd(entry.pnl)}
                  </span>
                  <span className="text-right">{usd(entry.volume)}</span>
                  <span className="text-right">{entry.trades}</span>
                  <span className="text-right">
                    {entry.winRate.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}