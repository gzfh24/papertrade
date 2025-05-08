'use client';

import { useEffect, useRef, memo } from 'react';

type Asset = 'BTCUSD' | 'XAUUSD' | 'SPXUSD' | 'NDXUSD';

const TV_MAP: Record<Asset, string> = {
    BTCUSD: 'BINANCE:BTCUSD',
    XAUUSD: 'FOREXCOM:XAUUSD',
    SPXUSD: 'OANDA:SPX500USD',
    NDXUSD: 'NASDAQ:NDX',
};

interface WidgetProps {
    asset: Asset;
}

function TradingViewWidget({ asset }: WidgetProps) {
    const tvSymbol = TV_MAP[asset];
    const container = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!container.current) return;

        container.current.innerHTML = '';

        const script = document.createElement('script');
        script.src =
        'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.type = 'text/javascript';
        script.innerHTML = `
        {
            "autosize": true,
            "symbol": "${tvSymbol}",
            "interval": "60",
            "timezone": "America/New_York",
            "theme": "light",
            "style": "1",
            "locale": "en",
            "hide_legend": true,
            "range": "5D",
            "allow_symbol_change": false,
            "save_image": false,
            "support_host": "https://www.tradingview.com"
        }`;
        container.current.appendChild(script);

    }, [asset]);

    return (
        <div
        ref={container}
        className="tradingview-widget-container h-full w-full rounded-xs overflow-hidden shadow-lg"
        >
        <div className="tradingview-widget-container__widget h-full w-full" />
        </div>
    );
}

export default memo(TradingViewWidget);
