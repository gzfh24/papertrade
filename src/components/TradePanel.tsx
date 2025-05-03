'use client';

import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TradePanelProps {
  symbol: "BTCUSD" | "XAUUSD" | "SPXUSD" | "NDXUSD";
  markPrice: number;
  onPlaced?: () => void;
}

export default function TradePanel({ symbol, markPrice, onPlaced }: TradePanelProps) {
  const [side, setSide] = useState<string>("long");
  const [usd, setUsd] = useState<string>("");
  const [leverage, setLeverage] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const placeTrade = async () => {
    const margin = Number(usd);
    if (!margin || margin <= 0) {
      toast.error("Enter a valid USD amount");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/trade/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol,
        margin,
        isLong: side === "long",
        leverage,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const { message } = await res.json();
      toast.error(message ?? "Trade failed");
      return;
    }

    toast.success("Trade placed");
    setUsd("");
    setLeverage(1);
    onPlaced?.();
  };

  return (
    <aside className="w-full max-w-[340px] xl:max-w-[380px] ml-auto xl:ml-8 pt-4">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center">New Position</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Long / Short switch */}
          <Tabs value={side} onValueChange={setSide} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="long" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-600">Long</TabsTrigger>
              <TabsTrigger value="short" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-600">Short</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* USD input */}
          <div className="space-y-2 mb-4">
            <label htmlFor="usd" className="text-sm font-medium">Margin (USD)</label>
            <Input
              id="usd"
              placeholder="0.00"
              value={usd}
              onChange={e => setUsd(e.target.value)}
              type="number"
              min={0}
              inputMode="decimal"
            />
          </div>

          {/* Leverage slider */}
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium flex justify-between"><span>Leverage</span><span>{leverage}×</span></label>
            <Slider
              value={[leverage]}
              min={1}
              max={50}
              step={1}
              onValueChange={v => setLeverage(v[0])}
            />
          </div>

          {/* Entry price */}
          <div className="flex justify-between mb-6 text-sm">
            <span className="text-muted-foreground">Entry price</span>
            <span>${markPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>

          <Button
            disabled={loading}
            className="w-full"
            onClick={placeTrade}
            variant={side === "long" ? "default" : "destructive"}
          >
            {loading ? "Placing…" : side === "long" ? "Long" : "Short"}
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}