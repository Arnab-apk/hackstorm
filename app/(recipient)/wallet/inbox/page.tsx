'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Inbox,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Shield,
  Building,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

interface PendingCredential {
  id: string;
  schemaName: string;
  issuerName: string;
  issuerDID: string;
  issuedAt: string;
  expiresAt: string;
  preview: Record<string, string>;
}

// Mock pending credentials
const mockPendingCredentials: PendingCredential[] = [
  {
    id: '1',
    schemaName: 'Google Cloud Professional',
    issuerName: 'Google Cloud',
    issuerDID: 'did:web:cloud.google.com',
    issuedAt: '2024-12-18T10:00:00Z',
    expiresAt: '2025-01-18T10:00:00Z',
    preview: {
      certification: 'Professional Cloud Architect',
      validUntil: '2027-12-18',
    },
  },
  {
    id: '2',
    schemaName: 'Professional Development',
    issuerName: 'LinkedIn Learning',
    issuerDID: 'did:web:linkedin.com',
    issuedAt: '2024-12-17T14:30:00Z',
    expiresAt: '2025-01-17T14:30:00Z',
    preview: {
      courseName: 'Advanced React Patterns',
      completionDate: '2024-12-17',
      instructor: 'Kent C. Dodds',
    },
  },
];

export default function InboxPage() {
  const router = useRouter();
  const [pendingCredentials, setPendingCredentials] = React.useState(mockPendingCredentials);
  const [selectedCredential, setSelectedCredential] = React.useState<PendingCredential | null>(null);
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);

  const handleAccept = async () => {
    if (!selectedCredential) return;
    
    setIsAccepting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Credential claimed successfully!', {
      description: `${selectedCredential.schemaName} has been added to your wallet.`,
    });
    
    setPendingCredentials(prev => prev.filter(c => c.id !== selectedCredential.id));
    setSelectedCredential(null);
    setIsAccepting(false);
  };

  const handleReject = async () => {
    if (!selectedCredential) return;
    
    setIsRejecting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.info('Credential rejected');
    
    setPendingCredentials(prev => prev.filter(c => c.id !== selectedCredential.id));
    setSelectedCredential(null);
    setIsRejecting(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        description="Review and claim credentials issued to you."
      />

      {pendingCredentials.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-8 w-8" />}
          title="No pending credentials"
          description="You don't have any credentials waiting to be claimed."
          action={
            <Button variant="outline" onClick={() => router.push('/wallet')}>
              Go to Wallet
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {pendingCredentials.map((credential) => (
            <Card key={credential.id} hover>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                      <Award className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{credential.schemaName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{credential.issuerName}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Issued {formatDate(credential.issuedAt)}
                        </div>
                        <Badge variant="warning">
                          Expires {formatDate(credential.expiresAt)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCredential(credential)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button onClick={() => setSelectedCredential(credential)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Claim
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Claim Dialog */}
      <Dialog open={!!selectedCredential} onOpenChange={() => setSelectedCredential(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Claim Credential</DialogTitle>
            <DialogDescription>
              Review the credential details before claiming it to your wallet.
            </DialogDescription>
          </DialogHeader>

          {selectedCredential && (
            <div className="space-y-4">
              {/* Issuer Info */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedCredential.issuerName}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedCredential.issuerDID}
                  </p>
                </div>
                <Badge variant="success" className="ml-auto">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              </div>

              {/* Credential Preview */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-card to-card/80 border border-border">
                <p className="text-sm text-muted-foreground mb-3">Credential Data</p>
                <div className="space-y-2">
                  {Object.entries(selectedCredential.preview).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Warning */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary">Verified Issuer</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This credential comes from a verified issuer. The signature has been validated against the blockchain.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isAccepting || isRejecting}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
            <Button onClick={handleAccept} disabled={isAccepting || isRejecting}>
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Claim to Wallet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
