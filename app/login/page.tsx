'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Role = 'issuer' | 'recipient' | 'verifier';

const roles = [
  {
    id: 'issuer' as Role,
    title: 'Issuer',
    description: 'Issue and manage verifiable credentials for your organization',
    icon: '🏛️',
    color: 'from-emerald-500/20 to-emerald-500/5',
    borderColor: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500/50',
  },
  {
    id: 'recipient' as Role,
    title: 'Recipient',
    description: 'Receive, store, and share your credentials securely',
    icon: '👤',
    color: 'from-blue-500/20 to-blue-500/5',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500/50',
  },
  {
    id: 'verifier' as Role,
    title: 'Verifier',
    description: 'Request and verify credentials from holders',
    icon: '✓',
    color: 'from-purple-500/20 to-purple-500/5',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500/50',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    
    // Simulate Web3Auth login delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Redirect based on role
    const routes: Record<Role, string> = {
      issuer: '/issuer',
      recipient: '/wallet',
      verifier: '/verifier',
    };
    
    router.push(routes[selectedRole]);
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
            <h1 className="text-4xl font-bold mb-6">
              Welcome to the future of{' '}
              <span className="text-gradient">digital identity</span>
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
            <h2 className="text-2xl font-bold mb-2">Sign in to continue</h2>
            <p className="text-muted-foreground">
              Select your role and connect with your social account
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-3 mb-8">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`w-full p-4 rounded-xl border transition-all duration-200 text-left group ${
                  selectedRole === role.id
                    ? `${role.borderColor} bg-gradient-to-r ${role.color}`
                    : `border-border hover:border-muted-foreground/30 bg-card ${role.hoverBorder}`
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{role.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{role.title}</h3>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 transition-all ${
                      selectedRole === role.id
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {selectedRole === role.id && (
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Social Login Button */}
          <Button
            size="xl"
            className="w-full"
            disabled={!selectedRole || isLoading}
            onClick={handleLogin}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
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
