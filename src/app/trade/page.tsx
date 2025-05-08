'use client';

import TradePanel from "@/components/TradePanel";
import NavBar from "@/components/NavBar";
import Trades from "@/components/Trades";
import { Toaster } from "sonner";
import { useState } from "react";
import dynamic from 'next/dynamic';
import AuthModal from "@/components/AuthModal";

const TradingViewWidget = dynamic(
  () => import('@/components/TradingViewWidget'),
  { ssr: false, loading: () => <div>Loading chart…</div> }
);

export default function TradePage() {
  const [asset, setAsset] = useState<'BTCUSD' | 'XAUUSD' | 'SPXUSD' | 'NDXUSD'>('BTCUSD');
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onAuthChange = {setAuthOpen} />
      <Toaster richColors />

      <main className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 p-4 max-w-7xl mx-auto w-full">
        {/* TradingView chart */}
        <section className="flex-1 min-h-[500px]">
          <TradingViewWidget asset={asset}/>
        </section>

        {/* Trade panel */}
        <TradePanel onAssetChange={setAsset} onAuthChange = {setAuthOpen} />
      </main>

      {/* Open trades section */}
      <section className="border-t p-4 max-w-7xl mx-auto w-full">
        <Trades />
      </section>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
