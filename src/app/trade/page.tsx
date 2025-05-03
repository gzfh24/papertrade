// app/trade/page.tsx
'use client';

import TradePanel from "@/components/TradePanel";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "sonner";
import { useState } from "react";

export default function TradePage() {
  // Placeholder mark price until you wire the realtime feed
  const [price] = useState(0);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <Toaster richColors />

      {/* Info bar */}
      <section className="w-full border-b py-2 px-4 text-sm flex justify-between bg-muted/50">
        <span>BTC/USD</span>
        <span>${price || "--"}</span>
      </section>

      {/* Main content */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 p-4 max-w-7xl mx-auto w-full">
        {/* TradingView chart placeholder */}
        <Card className="h-[480px] xl:h-full">
          <CardContent className="h-full flex items-center justify-center text-muted-foreground">
            TradingView Chart (coming soon)
          </CardContent>
        </Card>

        {/* Trade panel */}
        <TradePanel symbol="BTCUSD" markPrice={price || 0} />
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
