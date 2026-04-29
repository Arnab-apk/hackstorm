'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  EyeOff,
  FileCheck2,
  Fingerprint,
  ScanLine,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const roles = [
  {
    icon: Building2,
    title: 'Issuer',
    description: 'Create single or batch credentials, anchor their Merkle root, and manage revocation state.',
  },
  {
    icon: WalletCards,
    title: 'Recipient',
    description: 'Claim credentials, keep a personal wallet view, and decide which fields can be shared.',
  },
  {
    icon: ScanLine,
    title: 'Verifier',
    description: 'Validate shared credentials, request private claims, and inspect proof results.',
  },
];

const checks = [
  'Merkle proof validation',
  'Batch anchor lookup',
  'Issuer trust registry',
  'Revocation status',
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-lg font-bold text-primary-foreground">
              C
            </div>
            <div>
              <p className="font-semibold leading-none">CredVault</p>
              <p className="text-xs text-muted-foreground">Verifiable credentials</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="#workflow">Workflow</Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Launch App
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
            <ShieldCheck className="h-4 w-4" />
            Blockchain-anchored credential MVP
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            CredVault
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Issue credentials, prove they belong to an anchored batch, and share only the fields a verifier needs.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="xl" asChild>
              <Link href="/login">
                Open Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="#workflow">View Workflow</Link>
            </Button>
          </div>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
            {checks.map((check) => (
              <div key={check} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {check}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-sm font-medium">Verification Result</p>
              <p className="text-xs text-muted-foreground">University Degree credential</p>
            </div>
            <span className="rounded-md bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
              Valid
            </span>
          </div>
          <div className="space-y-3">
            {[
              ['Subject', 'did:pkh:eip155:137:0x8a12...b91e'],
              ['Merkle Root', '0x2ab7...62cf'],
              ['Anchor', 'Polygon Amoy batch record'],
              ['Disclosure', '4 visible fields, 3 hidden'],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 rounded-md bg-muted/45 p-3 sm:grid-cols-[120px_1fr]">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="break-all text-sm">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border p-4">
              <FileCheck2 className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-medium">Proof verified</p>
              <p className="mt-1 text-xs text-muted-foreground">Credential hash belongs to the stored Merkle root.</p>
            </div>
            <div className="rounded-md border border-border p-4">
              <EyeOff className="mb-3 h-5 w-5 text-accent" />
              <p className="text-sm font-medium">Privacy preserved</p>
              <p className="mt-1 text-xs text-muted-foreground">Hidden fields stay masked in public share links.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="border-y border-border bg-card/35">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-semibold">One flow, three workspaces</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The project is organized around the real credential lifecycle: issue, claim, share, verify.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((role) => (
              <div key={role.title} className="rounded-lg border border-border bg-background/60 p-5">
                <role.icon className="mb-4 h-6 w-6 text-primary" />
                <h3 className="font-semibold">{role.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-lg border border-border bg-card p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-primary">
              <Fingerprint className="h-4 w-4" />
              Wallet-based access
            </div>
            <h2 className="text-2xl font-semibold">Connect a wallet to enter the right portal.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Issuer and verifier roles are mapped from configured wallet addresses. Every other wallet opens the recipient wallet.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/login">
              Connect Wallet
              <BadgeCheck className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
