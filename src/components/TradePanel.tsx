'use client';

import { useState, useEffect } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createAuthClient } from 'better-auth/react';

const { useSession } = createAuthClient();

type Asset = 'BTCUSD' | 'XAUUSD' | 'SPXUSD' | 'NDXUSD';

interface TradePanelProps {
  initialAsset?: Asset;
  onAssetChange?: (asset: Asset) => void;
  onAuthChange: (open: boolean) => void;
  onPlaced?: () => void;
}

export default function TradePanel({
  initialAsset = 'BTCUSD',
  onAssetChange,
  onAuthChange,
  onPlaced,
}: TradePanelProps) {
  const { data: session, refetch } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const [symbol, setSymbol] = useState<Asset>(initialAsset);
  const [price, setPrice] = useState<number>(0);
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [usd, setUsd] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onAssetChange?.(symbol);
  }, [symbol, onAssetChange]);

  useEffect(() => {
    const handler = () => {
        refetch();
    };
    window.addEventListener('auth:success', handler);
    return () => window.removeEventListener('auth:success', handler)
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchPrice() {
      try {
        const res = await fetch(`/api/prices?symbol=${symbol}`, { cache: 'no-store' });
        const data = await res.json();
        if (mounted && data.price) setPrice(data.price);
      } catch {
        /* silent */
      }
    }
    fetchPrice();
    const id = setInterval(fetchPrice, 5_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [symbol]);

  const placeTrade = async () => {
    const margin = Number(usd);
    if (!margin || margin <= 0) {
      toast.error('Enter a valid USD amount');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/trade/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol,
        margin,
        isLong: side === 'long',
        leverage,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const { message } = await res.json();
      toast.error(message ?? 'Trade failed');
      return;
    }

    toast.success('Trade placed');
    setUsd('');
    setLeverage(1);
    window.dispatchEvent(new Event('trade:placed'));
    onPlaced?.();
  };

  return (
    <>
      <aside className="w-full max-w-[340px] xl:max-w-[380px] ml-auto xl:ml-8 pt-4">
        <Card className="shadow-lg rounded-xs">
          <CardHeader>
            <CardTitle className="text-center">Open Trade</CardTitle>
          </CardHeader>

          <CardContent>
            {/* asset selector */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Market</label>
              <Select value={symbol} onValueChange={(v) => setSymbol(v as Asset)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {['BTCUSD', 'XAUUSD', 'SPXUSD', 'NDXUSD'].map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* long / short tabs */}
            <Tabs
              value={side}
              onValueChange={(v) => setSide(v as 'long' | 'short')}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="long"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-600"
                >
                  Long
                </TabsTrigger>
                <TabsTrigger
                  value="short"
                  className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-600"
                >
                  Short
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* margin input */}
            <div className="space-y-2 mb-4">
              <label htmlFor="usd" className="text-sm font-medium">
                Margin (USD)
              </label>
              <Input
                id="usd"
                placeholder="0.00"
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                type="number"
                min={0}
                inputMode="decimal"
              />
            </div>

            {/* leverage slider */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium flex justify-between">
                <span>Leverage</span>
                <span>{leverage}×</span>
              </label>
              <Slider
                value={[leverage]}
                min={1}
                max={50}
                step={1}
                onValueChange={(v) => setLeverage(v[0])}
              />
            </div>

            {/* entry price */}
            <div className="flex justify-between mb-6 text-sm">
              <span className="text-muted-foreground">Entry price</span>
              <span>
                {price
                  ? `$${price.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}`
                  : '—'}
              </span>
            </div>

            {/* button */}
            {isLoggedIn ? (
              <Button
                disabled={loading}
                className="w-full"
                onClick={placeTrade}
                variant={side === 'long' ? 'default' : 'default'}
              >
                {loading ? 'Placing…' : side === 'long' ? 'Long' : 'Short'}
              </Button>
            ) : (
              <Button className="w-full" onClick={() => onAuthChange(true)}>
                Connect
              </Button>
            )}
          </CardContent>
        </Card>
      </aside>

    </>
  );
}
