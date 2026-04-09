'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Loader2, Wallet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Ethereum provider type
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

export default function LoginPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [walletInstalled, setWalletInstalled] = React.useState<boolean | null>(null);

  // Check if wallet is installed on mount
  React.useEffect(() => {
    setWalletInstalled(typeof window !== 'undefined' && !!window.ethereum);
  }, []);

  const connectWallet = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      // Check if ethereum provider exists
      if (!window.ethereum) {
        setError('No wallet detected. Please install MetaMask or another Web3 wallet.');
        setIsConnecting(false);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        setError('No accounts found. Please unlock your wallet.');
        setIsConnecting(false);
        return;
      }

      const address = accounts[0];

      // Call the login API with the wallet address
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || data.error || 'Login failed. Please try again.');
        setIsConnecting(false);
        return;
      }

      // The API wraps responses in { success, data: { role, address, ... } }
      const loginData = data.data || data;

      // Redirect based on role
      const routes: Record<string, string> = {
        issuer: '/issuer',
        user: '/wallet',
        verifier: '/verifier',
      };

      const redirectPath = routes[loginData.role] || '/wallet';
      router.push(redirectPath);
    } catch (err) {
      console.error('Wallet connection error:', err);
      
      // Handle specific errors
      if (err instanceof Error) {
        if (err.message.includes('User rejected')) {
          setError('Connection rejected. Please approve the connection request.');
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
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">C</span>
            </div>
            <span className="font-semibold text-xl">CredVault</span>
          </Link>
          
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6 text-balance">
              Welcome to the future of{' '}
              <span className="text-primary">digital identity</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Secure, decentralized credentials powered by blockchain technology. 
              Issue, store, and verify credentials with complete privacy control.
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Shield className="h-5 w-5 text-primary" />
            <span>Secured by Polygon Blockchain</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">C</span>
              </div>
              <span className="font-semibold text-xl">CredVault</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Connect your wallet</h2>
            <p className="text-muted-foreground">
              Connect your Web3 wallet to access CredVault. Your role will be determined automatically.
            </p>
          </div>

          {/* Role Info */}
          <div className="mb-8 p-4 rounded-xl border border-border bg-card">
            <h3 className="font-medium mb-3">How roles work</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-foreground">Issuer:</strong> Designated wallet for issuing credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-foreground">Verifier:</strong> Designated wallet for verifying credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong className="text-foreground">User:</strong> All other wallets - receive and share credentials</span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-destructive/50 bg-destructive/10 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Connect Wallet Button */}
          {walletInstalled === false ? (
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full"
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
              >
                <Wallet className="mr-2 h-5 w-5" />
                Install MetaMask
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You need a Web3 wallet to use CredVault. We recommend MetaMask.
              </p>
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full"
              disabled={isConnecting || walletInstalled === null}
              onClick={connectWallet}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet
                </>
              )}
            </Button>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>

          <div className="mt-8 pt-8 border-t border-border">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
