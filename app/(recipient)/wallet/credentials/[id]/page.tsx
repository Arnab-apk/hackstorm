'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Shield, 
  Calendar, 
  Building2, 
  Hash,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Clock,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/page-header';
import { useCredential, useClaimCredential } from '@/hooks/use-credentials';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function CredentialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const credentialId = params.id as string;
  
  const { data, error, isLoading, mutate } = useCredential(credentialId, 'recipient');
  const { claim } = useClaimCredential();
  
  const [claiming, setClaiming] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [disclosedFields, setDisclosedFields] = useState<Record<string, boolean>>({});
  const [expiryDays, setExpiryDays] = useState<number>(7);

  const credential = data?.credential;
  const credentialJSON = data?.credentialJSON;

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await claim(credentialId);
      toast.success('Credential claimed successfully!');
      mutate();
    } catch (err) {
      toast.error('Failed to claim credential');
    } finally {
      setClaiming(false);
    }
  };

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const disclosed = Object.entries(disclosedFields)
        .filter(([_, show]) => show)
        .map(([field]) => field);
      
      const response = await fetch('/api/recipient/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId,
          disclosedFields: disclosed,
          expiresInDays: expiryDays,
        }),
      });

      if (!response.ok) throw new Error('Failed to create share link');
      
      const data = await response.json();
      setShareLink(data.shareLink);
      toast.success('Share link created!');
    } catch (err) {
      toast.error('Failed to create share link');
    } finally {
      setShareLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleField = (field: string) => {
    setDisclosedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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

  const credentialData = (credentialJSON?.credentialSubject || credential?.credentialJSON?.credentialSubject || {}) as Record<string, unknown>;
  const fields = Object.entries(credentialData).filter(([key]) => key !== 'id');

  // Initialize disclosed fields if empty
  if (Object.keys(disclosedFields).length === 0 && fields.length > 0) {
    const initial: Record<string, boolean> = {};
    fields.forEach(([key]) => {
      initial[key] = true; // Default all to shown
    });
    setDisclosedFields(initial);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader 
          title={credential.schemaName}
          description={`Issued on ${new Date(credential.issuedAt).toLocaleDateString()}`}
        />
      </div>

      {/* Status Banner */}
      {!credential.claimed && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Ready to Claim</p>
                <p className="text-sm text-muted-foreground">
                  Claim this credential to your wallet
                </p>
              </div>
            </div>
            <Button onClick={handleClaim} disabled={claiming}>
              {claiming ? 'Claiming...' : 'Claim Credential'}
            </Button>
          </CardContent>
        </Card>
      )}

      {credential.revoked && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="font-medium text-destructive">Credential Revoked</p>
              <p className="text-sm text-muted-foreground">
                This credential was revoked on {new Date(credential.revokedAt!).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credential Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{credential.schemaName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4" />
                Issued by Demo University
              </CardDescription>
            </div>
            <Badge variant={credential.claimed ? 'default' : 'secondary'}>
              {credential.revoked ? 'Revoked' : credential.claimed ? 'Claimed' : 'Unclaimed'}
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
                IPFS CID
              </span>
              <span className="font-mono text-xs">
                {credential.ipfsCID?.slice(0, 12)}...{credential.ipfsCID?.slice(-8)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {credential.claimed && !credential.revoked && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Credential</DialogTitle>
                  <DialogDescription>
                    Choose which fields to share and generate a verification link.
                  </DialogDescription>
                </DialogHeader>
                
                {!shareLink ? (
                  <div className="space-y-6 pt-4">
                    {/* Field Selection */}
                    <div className="space-y-4">
                      <Label>Fields to Share</Label>
                      <div className="space-y-3">
                        {fields.map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {disclosedFields[key] ? (
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                            <Switch 
                              checked={disclosedFields[key] ?? true}
                              onCheckedChange={() => toggleField(key)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expiry */}
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Link Expiry (days)
                      </Label>
                      <Input
                        id="expiry"
                        type="number"
                        min={1}
                        max={365}
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
                      />
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={handleShare}
                      disabled={shareLoading}
                    >
                      {shareLoading ? 'Generating...' : 'Generate Share Link'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="font-medium">Share link created!</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input 
                        value={shareLink} 
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button size="icon" variant="outline" onClick={copyToClipboard}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Anyone with this link can verify your credential with the fields you selected.
                    </p>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setShareLink(null);
                        setShareDialogOpen(false);
                      }}
                    >
                      Done
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Verification Info */}
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
    </div>
  );
}
