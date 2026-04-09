'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Shield,
    title: 'Blockchain Secured',
    description: 'Credentials anchored on Polygon for immutable, tamper-proof verification.',
  },
  {
    icon: Lock,
    title: 'Self-Sovereign Identity',
    description: 'Users control their data with selective disclosure and ZKP verification.',
  },
  {
    icon: Zap,
    title: 'Instant Verification',
    description: 'Verify credentials in seconds without contacting the issuer.',
  },
  {
    icon: Globe,
    title: 'Decentralized Trust',
    description: 'No central authority. Trust is distributed across the network.',
  },
];

const steps = [
  { step: '01', title: 'Issue', description: 'Organizations issue verifiable credentials to recipients' },
  { step: '02', title: 'Store', description: 'Recipients securely store credentials in their digital wallet' },
  { step: '03', title: 'Verify', description: 'Third parties verify credentials with cryptographic proof' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">C</span>
            </div>
            <span className="font-semibold text-lg">CredVault</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Button asChild>
              <Link href="/login">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
              <Shield className="h-4 w-4" />
              <span>Powered by Blockchain Technology</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-gradient">Decentralized</span>{' '}
              Credentials for the{' '}
              <span className="text-gradient">Digital Age</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Issue, manage, and verify credentials with blockchain-anchored trust. 
              Privacy-preserving, tamper-proof, and universally verifiable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" asChild>
                <Link href="/login">
                  Start Issuing Credentials
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="#how-it-works">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
              <div className="grid md:grid-cols-3 gap-6 p-8">
                {/* Issuer Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    ISSUER DASHBOARD
                  </div>
                  <div className="rounded-xl bg-sidebar border border-border p-4 space-y-3">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-primary/20 rounded-lg" />
                  </div>
                </div>
                
                {/* Credential Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    VERIFIABLE CREDENTIAL
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-card to-card/80 border border-border p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="h-3 bg-foreground/80 rounded w-24 mb-1" />
                        <div className="h-2 bg-muted-foreground/50 rounded w-16" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Status</span>
                        <span className="text-success">Verified</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Issued</span>
                        <span>Dec 2024</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verifier Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                    VERIFICATION RESULT
                  </div>
                  <div className="rounded-xl bg-sidebar border border-border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="text-sm font-medium">Valid Credential</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-success" />
                        Signature verified
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-success" />
                        On-chain anchor found
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-success" />
                        Not revoked
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for Trust</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Modern credential management with enterprise-grade security and user-first privacy.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A simple three-step process for issuing and verifying credentials.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-5xl font-bold text-primary/20 mb-4">{step.step}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join organizations worldwide using decentralized credentials for secure, 
            verifiable identity management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" asChild>
              <Link href="/login">
                Create Free Account
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <span className="text-sm text-muted-foreground">CredVault - Decentralized Credentials</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Built for HackStorm 2024
          </div>
        </div>
      </footer>
    </div>
  );
}
