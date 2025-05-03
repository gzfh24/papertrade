// components/NavBar.tsx
import Link from "next/link";
import { createAuthClient } from "better-auth/react"
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import AuthModal from "@/components/AuthModal";

const { useSession } = createAuthClient()

export default function NavBar() {
    const {
        data: session,
        isPending, //loading state
        error, //error object 
        refetch //refetch the session
    } = useSession()
    const [authOpen, setAuthOpen] = useState(false);

    useEffect(() => {
        if (!authOpen) {
          refetch();
        }
      }, [authOpen, refetch]);

    return (
        <>
            <nav className="w-full border-b bg-background/70 backdrop-blur sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
                {/* Nav tabs */}
                <Tabs defaultValue="trade" className="hidden sm:block">
                <TabsList className="bg-transparent space-x-6 shadow-none">
                    <TabsTrigger
                    value="trade"
                    asChild
                    className="data-[state=active]:border-b-2 data-[state=active]:border-foreground/80 rounded-none px-0"
                    >
                    <Link href="/trade">Trade</Link>
                    </TabsTrigger>

                    <TabsTrigger
                    value="portfolio"
                    asChild
                    className="data-[state=active]:border-b-2 data-[state=active]:border-foreground/80 rounded-none px-0"
                    >
                    <Link href="/portfolio">Portfolio</Link>
                    </TabsTrigger>

                    <TabsTrigger
                    value="leaderboard"
                    asChild
                    className="data-[state=active]:border-b-2 data-[state=active]:border-foreground/80 rounded-none px-0"
                    >
                    <Link href="/leaderboard">Leaderboards</Link>
                    </TabsTrigger>
                </TabsList>
                </Tabs>

                {/* Auth controls */}
                {session?.user?.id ? (
                <div className="flex items-center gap-4">
                    <span
                    className="text-sm font-medium hidden sm:inline-block truncate max-w-[120px]"
                    title={session.user.name || session.user.email}
                    >
                    {session.user.name || session.user.email}
                    </span>
                    <form action="/api/signout" method="post">
                    <Button size="sm" variant="secondary" type="submit">
                        Sign out
                    </Button>
                    </form>
                </div>
                ) : (
                    <Button size="sm" onClick={() => setAuthOpen(true)}>Connect</Button>
                )}
            </div>
            </nav>
            <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
        </>
    );
    }
