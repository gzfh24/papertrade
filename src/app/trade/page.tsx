// app/trade/page.tsx
'use client';

import TradePanel from "@/components/TradePanel";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "sonner";
import { useState } from "react";
import dynamic from 'next/dynamic';

const TradingViewWidget = dynamic(
  () => import('@/components/TradingViewWidget'),
  { ssr: false, loading: () => <div>Loading chart…</div> }
);

export default function TradePage() {
  // Placeholder mark price until you wire the realtime feed
  const [price] = useState(0);
  const [asset, setAsset] = useState<'BTCUSD' | 'XAUUSD' | 'SPXUSD' | 'NDXUSD'>('BTCUSD');

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <Toaster richColors />

      {/* Main content */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 p-4 max-w-7xl mx-auto w-full">
        {/* TradingView chart placeholder */}
        <section className="flex-1 min-h-[500px]">
          <TradingViewWidget asset={asset}/>
        </section>

        {/* Trade panel */}
        <TradePanel onAssetChange={setAsset} />
      </main>

      {/* Open trades section */}
      <section className="border-t p-4 max-w-7xl mx-auto w-full">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Open Trades Table (coming soon)
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
