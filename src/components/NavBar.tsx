import Link from "next/link";
import { createAuthClient } from "better-auth/react"
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation"

const { useSession } = createAuthClient()

interface NavBarProps {
    onAuthChange: (open: boolean) => void;
  }

export default function NavBar({
    onAuthChange,
}: NavBarProps) {
    const pathname = usePathname();
    const {
        data: session,
        isPending,
        refetch
    } = useSession()
    const [balance, setBalance] = useState<number | null>(null);

    const fetchBalance = useCallback(async () => {
        if (!session?.user?.id) return;
        try {
        const res = await fetch('/api/portfolio', {
            credentials: 'include',
            cache: 'no-store',
        });
        const data = await res.json();
        if (res.ok && typeof data.balance === 'number') {
            setBalance(data.balance);
        }
        } catch {
            setBalance(null);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);
    
    useEffect(() => {
        window.addEventListener('trade:placed', fetchBalance);
        return () => window.removeEventListener('trade:placed', fetchBalance);
    }, [fetchBalance]);
    
    useEffect(() => {
        const handler = () => {
            refetch();
        };
        window.addEventListener('auth:success', handler);
        return () => window.removeEventListener('auth:success', handler)
    }, []);

    useEffect(() => {
        if (isPending) return;
        if (pathname === '/trade' && !session?.user?.id) onAuthChange(true);
      }, [isPending, session?.user?.id]);

    const getActiveTab = () => {
        switch (pathname) {
          case '/trade':
            return 'trade';
          case '/portfolio':
            return 'portfolio';
          case '/leaderboard':
            return 'leaderboard';
          default:
            return 'trade';
        }
    };

    return (
        <>
            <nav className="w-full border-b bg-background/70 backdrop-blur sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
                {/* tabs */}
                <Tabs value={getActiveTab()}>
                <TabsList className="bg-transparent space-x-6 shadow-none">
                    <TabsTrigger
                    value="trade"
                    asChild
                    className="data-[state=active]:border-b-2 data-[state=active]:border-foreground/80 rounded-none px-0"
                    >
                    <Link href="/trade" className="hover:border-b-2 hover:border-foreground/50 transition-all ease-in-out duration-200">Trade</Link>
                    </TabsTrigger>

                    <TabsTrigger
                    value="portfolio"
                    asChild
                    className="data-[state=active]:border-b-2 data-[state=active]:border-foreground/80 rounded-none px-0"
                    >
                    <Link href="/portfolio" className="hover:border-b-2 hover:border-foreground/50 transition-all ease-in-out duration-200">Portfolio</Link>
                    </TabsTrigger>

                    <TabsTrigger
                    value="leaderboard"
                    asChild
                    className="data-[state=active]:border-b-2 data-[state=active]:border-foreground/80 rounded-none px-0"
                    >
                    <Link href="/leaderboard" className="hover:border-b-2 hover:border-foreground/50 transition-all ease-in-out duration-200">Leaderboard</Link>
                    </TabsTrigger>
                </TabsList>
                </Tabs>

                {/* auth */}
                {session?.user?.id ? (
                <div className="flex items-center gap-4">
                    <span
                    className="text-sm font-medium hidden sm:inline-block truncate max-w-[120px]"
                    title={session.user.name || session.user.email}
                    >
                    {session.user.name || session.user.email}
                    </span>
                    {balance !== null && (
                        <span className="text-sm font-medium tabular-nums hidden lg:inline-block">
                        ${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                    )}
                    <form action="/api/signout" method="post">
                    <Button size="sm" variant="secondary" type="submit">
                        Sign out
                    </Button>
                    </form>
                </div>
                ) : (
                    <Button size="sm" onClick={() => onAuthChange(true)}>Connect</Button>
                )}
            </div>
            </nav>
        </>
    );
    }