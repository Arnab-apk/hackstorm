'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Shield,
  Calendar,
  Building2,
  Hash,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
import { useCredential, useRevokeCredential } from '@/hooks/use-credentials';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function IssuerCredentialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const credentialId = params.id as string;
  
  const { data, error, isLoading, mutate } = useCredential(credentialId, 'issuer');
  const { revoke } = useRevokeCredential();
  
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  const credential = data?.credential;

  const handleRevoke = async () => {
    if (!revokeReason.trim()) {
      toast.error('Please provide a reason for revocation');
      return;
    }

    setRevoking(true);
    try {
      await revoke(credentialId, revokeReason);
      toast.success('Credential revoked successfully');
      setRevokeDialogOpen(false);
      mutate();
    } catch (err) {
      toast.error('Failed to revoke credential');
    } finally {
      setRevoking(false);
    }
  };

  const copyAddress = async () => {
    if (credential?.recipientAddress) {
      await navigator.clipboard.writeText(credential.recipientAddress);
      setCopied(true);
      toast.success('Address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Credential not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const credentialData = credential.credentialJSON?.credentialSubject as Record<string, unknown> || {};
  const fields = Object.entries(credentialData).filter(([key]) => key !== 'id');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader 
          title={credential.schemaName}
          description={`Credential ID: ${credentialId}`}
        />
      </div>

      {/* Status Banner */}
      {credential.revoked && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="font-medium text-destructive">Credential Revoked</p>
              <p className="text-sm text-muted-foreground">
                Revoked on {new Date(credential.revokedAt!).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipient Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-muted-foreground" />
            Recipient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email</span>
            </div>
            <span className="font-medium">{credential.recipientEmail}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Wallet Address</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {credential.recipientAddress?.slice(0, 10)}...{credential.recipientAddress?.slice(-8)}
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Claim Status</span>
            </div>
            <Badge variant={credential.claimed ? 'default' : 'secondary'}>
              {credential.claimed ? 'Claimed' : 'Pending'}
            </Badge>
          </div>
          {credential.claimed && credential.claimedAt && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Claimed At</span>
              </div>
              <span>{new Date(credential.claimedAt).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credential Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{credential.schemaName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4" />
                Demo University
              </CardDescription>
            </div>
            <Badge variant={credential.revoked ? 'destructive' : credential.claimed ? 'default' : 'secondary'}>
              {credential.revoked ? 'Revoked' : credential.claimed ? 'Active' : 'Pending'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Credential Fields */}
          <div className="space-y-4">
            {fields.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <span className="text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Issued Date
              </span>
              <span>{new Date(credential.issuedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Batch ID
              </span>
              <span className="font-mono text-xs">{credential.batchId}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Hash className="w-4 h-4" />
                IPFS CID
              </span>
              <span className="font-mono text-xs">
                {credential.ipfsCID?.slice(0, 12)}...{credential.ipfsCID?.slice(-8)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            Verification Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Merkle Proof</span>
            <Badge variant="outline" className="text-primary">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Valid
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Blockchain Anchor</span>
            <Badge variant="outline" className="text-primary">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Confirmed
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Revocation Status</span>
            <Badge variant={credential.revoked ? 'destructive' : 'outline'} className={!credential.revoked ? 'text-primary' : ''}>
              {credential.revoked ? (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Revoked
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">View on Explorer</span>
            <a 
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline text-sm"
            >
              Polygonscan
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {!credential.revoked && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Revoke Credential
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Revoke Credential</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. The credential will be marked as revoked on-chain.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Revocation</Label>
                    <Textarea
                      id="reason"
                      placeholder="Explain why this credential is being revoked..."
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleRevoke} disabled={revoking}>
                    {revoking ? 'Revoking...' : 'Confirm Revocation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
