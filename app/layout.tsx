import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CredVault | Decentralized Credentials',
    template: '%s | CredVault',
  },
  description: 'Issue, manage, and verify decentralized credentials with blockchain-anchored trust',
  keywords: ['credentials', 'blockchain', 'verifiable', 'decentralized', 'identity', 'DID'],
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="font-sans antialiased min-h-screen bg-background">
        {children}
        <Toaster 
          theme="dark" 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(0 0% 7%)',
              border: '1px solid hsl(0 0% 18%)',
              color: 'hsl(0 0% 100%)',
            },
          }}
        />
      </body>
    </html>
  );
}
