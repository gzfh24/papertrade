'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AuthModalProps {
    open: boolean;
    onOpenChange: (o: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
const [tab, setTab] = useState<'signin' | 'signup'>('signin');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [username, setUsername] = useState('');
const router = useRouter();

const reset = () => {
    setEmail('');
    setPassword('');
    setUsername('');
};

async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const endpoint = tab === 'signin' ? '/api/signin' : '/api/signup';
    const body: Record<string, string> = { email, password };
    if (tab === 'signup') body.username = username;

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        return;
    }

    toast.success(tab === 'signin' ? 'Signed in!' : 'Account created!');
    window.dispatchEvent(new Event('auth:success'));


    reset();
    onOpenChange(false);
    router.refresh();
}

return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
    {/* frosted‑glass overlay */}
    <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

    {/* animated card */}
    <DialogContent
        className="z-50 w-[92%] sm:w-full sm:max-w-md rounded-2xl border
                bg-background p-6 shadow-xl animate-in
                fade-in zoom-in-90 duration-200"
    >
        <DialogHeader>
        <DialogTitle className="text-center text-2xl font-semibold tracking-tight">
            {tab === 'signin' ? 'Welcome back' : 'Create an account'}
        </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mt-5">
        <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign&nbsp;In</TabsTrigger>
            <TabsTrigger value="signup">Sign&nbsp;Up</TabsTrigger>
        </TabsList>

        {/* ───────────────────────── Sign‑in ───────────────────────── */}
        <TabsContent value="signin">
            <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
            />
            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
            />
            <Button type="submit" className="w-full">
                Sign&nbsp;In
            </Button>
            </form>
        </TabsContent>

        {/* ───────────────────────── Sign‑up ───────────────────────── */}
        <TabsContent value="signup">
            <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
            />
            <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
            />
            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
            />
            <Button type="submit" className="w-full">
                Create&nbsp;Account
            </Button>
            </form>
        </TabsContent>
        </Tabs>
    </DialogContent>
    </Dialog>
);
}
