'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ScanLine,
  Link as LinkIcon,
  Upload,
  CheckCircle2,
  XCircle,
  Shield,
  Clock,
  Building,
  User,
  Award,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

type VerificationStatus = 'idle' | 'verifying' | 'valid' | 'invalid' | 'revoked';

interface VerificationResult {
  status: VerificationStatus;
  credential?: {
    type: string;
    holder: string;
    issuer: string;
    issuerDID: string;
    issuedAt: string;
    claims: Record<string, string>;
  };
  checks?: {
    signature: boolean;
    onChain: boolean;
    notRevoked: boolean;
    notExpired: boolean;
  };
  error?: string;
}

export default function VerifyScanPage() {
  const [activeTab, setActiveTab] = React.useState('url');
  const [verificationUrl, setVerificationUrl] = React.useState('');
  const [result, setResult] = React.useState<VerificationResult>({ status: 'idle' });

  const handleVerify = async () => {
    setResult({ status: 'verifying' });
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful result
    setResult({
      status: 'valid',
      credential: {
        type: 'University Degree',
        holder: 'Alice Johnson',
        issuer: 'Stanford University',
        issuerDID: 'did:web:stanford.edu',
        issuedAt: '2024-05-15T10:00:00Z',
        claims: {
          'Degree Type': 'Bachelor of Science',
          'Major': 'Computer Science',
          'Graduation Date': 'May 15, 2024',
          'GPA': '3.85',
          'Honors': 'Magna Cum Laude',
        },
      },
      checks: {
        signature: true,
        onChain: true,
        notRevoked: true,
        notExpired: true,
      },
    });
  };

  const handleReset = () => {
    setResult({ status: 'idle' });
    setVerificationUrl('');
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="h-16 w-16 text-success" />;
      case 'invalid':
      case 'revoked':
        return <XCircle className="h-16 w-16 text-destructive" />;
      default:
        return <Shield className="h-16 w-16 text-muted-foreground" />;
    }
  };

  const getStatusMessage = (status: VerificationStatus) => {
    switch (status) {
      case 'valid':
        return { title: 'Valid Credential', description: 'This credential is authentic and has not been revoked.' };
      case 'invalid':
        return { title: 'Invalid Credential', description: 'This credential could not be verified.' };
      case 'revoked':
        return { title: 'Revoked Credential', description: 'This credential has been revoked by the issuer.' };
      default:
        return { title: 'Ready to Verify', description: 'Enter a verification URL or scan a QR code.' };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="Verify Credential"
        description="Verify the authenticity of a verifiable credential."
      />

      {result.status === 'idle' && (
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="url">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="scan">
                  <ScanLine className="mr-2 h-4 w-4" />
                  Scan QR
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Verification URL</Label>
                    <Input
                      placeholder="https://credvault.app/verify/..."
                      value={verificationUrl}
                      onChange={(e) => setVerificationUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste the verification URL from the credential holder.
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    disabled={!verificationUrl}
                    onClick={handleVerify}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Credential
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="scan">
                <div className="space-y-4">
                  <div className="aspect-square max-w-sm mx-auto rounded-2xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center">
                    <ScanLine className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="font-medium">Camera Access Required</p>
                    <p className="text-sm text-muted-foreground text-center px-4">
                      Allow camera access to scan QR codes
                    </p>
                    <Button variant="outline" className="mt-4">
                      Enable Camera
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upload">
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium mb-1">Upload QR Code Image</p>
                    <p className="text-sm text-muted-foreground">
                      Drop a QR code image or click to browse
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {result.status === 'verifying' && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Verifying Credential</h3>
            <p className="text-muted-foreground">
              Checking signature, on-chain anchor, and revocation status...
            </p>
          </CardContent>
        </Card>
      )}

      {(result.status === 'valid' || result.status === 'invalid' || result.status === 'revoked') && (
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-4">{getStatusIcon(result.status)}</div>
              <h3 className="text-2xl font-bold mb-2">
                {getStatusMessage(result.status).title}
              </h3>
              <p className="text-muted-foreground">
                {getStatusMessage(result.status).description}
              </p>
            </CardContent>
          </Card>

          {/* Verification Checks */}
          {result.checks && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Verification Checks</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: 'signature', label: 'Digital Signature', value: result.checks.signature },
                    { key: 'onChain', label: 'On-Chain Anchor', value: result.checks.onChain },
                    { key: 'notRevoked', label: 'Not Revoked', value: result.checks.notRevoked },
                    { key: 'notExpired', label: 'Not Expired', value: result.checks.notExpired },
                  ].map((check) => (
                    <div
                      key={check.key}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        check.value ? 'bg-success/10' : 'bg-destructive/10'
                      }`}
                    >
                      {check.value ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span className={check.value ? 'text-success' : 'text-destructive'}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Credential Details */}
          {result.credential && (
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Award className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">{result.credential.type}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {result.credential.holder}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Issuer */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{result.credential.issuer}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {result.credential.issuerDID}
                    </p>
                  </div>
                  <Badge variant="success">
                    <Shield className="mr-1 h-3 w-3" />
                    Verified Issuer
                  </Badge>
                </div>

                {/* Claims */}
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-3">
                    Credential Claims
                  </h5>
                  <div className="space-y-2">
                    {Object.entries(result.credential.claims).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b border-border last:border-0"
                      >
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issue Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Issued on {formatDate(result.credential.issuedAt)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Verify Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
