'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  ScanLine,
  Wallet,
  WalletCards,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BlurText from '@/components/react-bits/text/BlurText';
import DecryptedText from '@/components/react-bits/text/DecryptedText';
import StarBorder from '@/components/react-bits/animations/StarBorder';
import GlareHover from '@/components/react-bits/animations/GlareHover';
import AnimatedContent from '@/components/react-bits/animations/AnimatedContent';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

const roleCards = [
  { icon: Building2, title: 'Issuer', copy: 'Create credentials and batches' },
  { icon: WalletCards, title: 'Recipient', copy: 'Claim, manage, and share' },
  { icon: ScanLine, title: 'Verifier', copy: 'Request and inspect proofs' },
];

export default function LoginPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [walletInstalled, setWalletInstalled] = React.useState<boolean | null>(null);
  const [email, setEmail] = React.useState('');

  React.useEffect(() => {
    setWalletInstalled(typeof window !== 'undefined' && !!window.ethereum);
  }, []);

  const connectWallet = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      if (!window.ethereum) {
        setError('No wallet detected. Please install MetaMask or another Web3 wallet.');
        setIsConnecting(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        setError('No accounts found. Please unlock your wallet.');
        setIsConnecting(false);
        return;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: accounts[0], email: email || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || data.error || 'Login failed. Please try again.');
        setIsConnecting(false);
        return;
      }

      const loginData = data.data || data;
      const routes: Record<string, string> = {
        issuer: '/issuer',
        user: '/wallet',
        verifier: '/verifier',
      };

      router.push(routes[loginData.role] || '/wallet');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('User rejected')) {
          setError('Connection rejected. Please approve the wallet request.');
        } else if (err.message.includes('Already processing')) {
          setError('A connection request is already pending. Please check your wallet.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <section className="relative hidden w-[48%] border-r border-border bg-card/40 lg:flex">
        <div className="flex w-full flex-col justify-between p-12">
          <Link href="/" className="flex w-fit items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-xl font-bold text-primary-foreground">
              C
            </div>
            <span className="text-xl font-semibold">CredVault</span>
          </Link>

          <div className="max-w-md">
            <BlurText
              text="Enter the workspace for your credential role."
              className="mb-5 text-4xl font-semibold"
              delay={100}
              animateBy="words"
            />
            <p className="text-base leading-7 text-muted-foreground">
              Connect a wallet, and the app routes you to issuer, recipient, or verifier tools based on configured role addresses.
            </p>
            <div className="mt-8 grid gap-3">
              {roleCards.map((role, index) => (
                <AnimatedContent key={role.title} distance={30} direction="vertical" delay={0.2 + index * 0.1}>
                  <GlareHover className="rounded-md">
                    <div className="flex items-center gap-3 rounded-md border border-border bg-background/50 p-3">
                      <role.icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{role.title}</p>
                        <p className="text-xs text-muted-foreground">{role.copy}</p>
                      </div>
                    </div>
                  </GlareHover>
                </AnimatedContent>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span>Merkle proofs, selective disclosure, and revocation checks</span>
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-xl font-bold text-primary-foreground">
                C
              </div>
              <span className="text-xl font-semibold">CredVault</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-semibold">
              <DecryptedText
                text="Connect your wallet"
                speed={40}
                animateOn="view"
                className="text-foreground"
                encryptedClassName="text-primary/40"
              />
            </h2>
            <p className="text-muted-foreground">Your wallet address decides which portal opens after login.</p>
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
              <span className="text-muted-foreground"> optional</span>
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">Use the email your credentials were issued to.</p>
          </div>

          <div className="mb-8 rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 font-medium">Role routing</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span><strong className="text-foreground">Issuer:</strong> configured wallet for issuing credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span><strong className="text-foreground">Verifier:</strong> configured wallet for verification work</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span><strong className="text-foreground">Recipient:</strong> every other wallet opens the credential wallet</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {walletInstalled === false ? (
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full"
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
              >
                <Wallet className="h-5 w-5" />
                Install MetaMask
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                A browser wallet is required for this MVP.
              </p>
            </div>
          ) : (
            <StarBorder color="hsl(166, 73%, 44%)" speed="6s" className="w-full">
              <Button
                size="lg"
                className="w-full"
                disabled={isConnecting || walletInstalled === null}
                onClick={connectWallet}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </StarBorder>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            This MVP stores a secure session cookie after wallet login.
          </p>

          <div className="mt-8 border-t border-border pt-8">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
