'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
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
  Loader2,
  Shield,
  Building,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PendingCredential {
  id: string;
  schemaId: string;
  schemaName: string;
  issuedAt: string;
}

export default function InboxPage() {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR('/api/recipient/credentials?status=unclaimed', fetcher);
  
  const [selectedCredential, setSelectedCredential] = React.useState<PendingCredential | null>(null);
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);

  const pendingCredentials: PendingCredential[] = data?.data?.credentials || [];

  const handleAccept = async () => {
    if (!selectedCredential) return;
    
    setIsAccepting(true);
    try {
      const response = await fetch(`/api/recipient/credentials/${selectedCredential.id}/claim`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to claim credential');
      }
      
      toast.success('Credential claimed successfully!', {
        description: `${selectedCredential.schemaName} has been added to your wallet.`,
      });
      
      mutate();
      setSelectedCredential(null);
    } catch (error: any) {
      toast.error('Failed to claim credential', {
        description: error.message,
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCredential) return;
    
    setIsRejecting(true);
    // For now, just close the dialog since we don't have a reject API
    toast.info('Credential rejected');
    setSelectedCredential(null);
    setIsRejecting(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        description="Review and claim credentials issued to you."
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Failed to load credentials. Please try again.
          </CardContent>
        </Card>
      ) : pendingCredentials.length === 0 ? (
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
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Issued {formatDate(credential.issuedAt)}
                        </div>
                        <Badge variant="warning">
                          Pending Claim
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
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
              {/* Credential Info */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-card to-card/80 border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{selectedCredential.schemaName}</p>
                    <p className="text-sm text-muted-foreground">
                      Issued {formatDate(selectedCredential.issuedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Info */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary">Verified Credential</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This credential has been issued by a verified issuer and anchored on the blockchain.
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
