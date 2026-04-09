'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Building2, 
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
import { useRequest, useRespondToRequest } from '@/hooks/use-requests';
import { useRecipientCredentials } from '@/hooks/use-credentials';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  
  const { data, error, isLoading, mutate } = useRequest(requestId, 'recipient');
  const { data: credentialsData } = useRecipientCredentials('claimed');
  const { respond } = useRespondToRequest();
  
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);
  const [disclosedFields, setDisclosedFields] = useState<Record<string, boolean>>({});
  const [responding, setResponding] = useState(false);

  const request = data?.request;
  const credentials = credentialsData?.credentials || [];
  const matchingCredentials = credentials.filter(c => c.schemaId === request?.credentialType);

  const handleApprove = async () => {
    if (!selectedCredentialId) {
      toast.error('Please select a credential');
      return;
    }

    setResponding(true);
    try {
      const disclosed = Object.entries(disclosedFields)
        .filter(([_, show]) => show)
        .map(([field]) => field);

      await respond(requestId, 'approve', {
        credentialId: selectedCredentialId,
        disclosedFields: disclosed,
      });
      
      toast.success('Request approved!');
      router.push('/wallet/inbox');
    } catch (err) {
      toast.error('Failed to approve request');
    } finally {
      setResponding(false);
    }
  };

  const handleReject = async () => {
    setResponding(true);
    try {
      await respond(requestId, 'reject');
      toast.success('Request rejected');
      router.push('/wallet/inbox');
    } catch (err) {
      toast.error('Failed to reject request');
    } finally {
      setResponding(false);
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
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Request not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const isExpired = new Date(request.expiresAt) < new Date();
  const isPending = request.status === 'pending' && !isExpired;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader 
          title="Verification Request"
          description={`From ${request.verifierName}`}
        />
      </div>

      {/* Verifier Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {request.verifierName}
                  {request.verifierVerified && (
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  )}
                </CardTitle>
                <CardDescription className="font-mono text-xs">
                  {request.verifierDID.slice(0, 20)}...
                </CardDescription>
              </div>
            </div>
            <Badge variant={
              request.status === 'approved' ? 'default' :
              request.status === 'rejected' ? 'destructive' :
              isExpired ? 'secondary' : 'outline'
            }>
              {isExpired ? 'Expired' : request.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {isExpired 
                ? `Expired on ${new Date(request.expiresAt).toLocaleDateString()}`
                : `Expires on ${new Date(request.expiresAt).toLocaleDateString()}`
              }
            </span>
          </div>
          {request.message && (
            <p className="mt-4 text-sm p-3 bg-muted/50 rounded-lg">
              {request.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Requested Claims */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Requested Information</CardTitle>
          <CardDescription>
            The verifier is requesting proof of the following claims
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {request.claims.map((claim, index) => (
            <div 
              key={index}
              className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                {claim.type === 'reveal' ? (
                  <Eye className="w-4 h-4 text-warning" />
                ) : (
                  <Shield className="w-4 h-4 text-primary" />
                )}
                <div>
                  <p className="font-medium capitalize">
                    {claim.field.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {claim.type === 'reveal' 
                      ? 'Will see actual value'
                      : claim.type === 'equals'
                        ? `Must equal "${claim.value}"`
                        : claim.type === 'greaterThan'
                          ? `Must be greater than ${claim.value}`
                          : claim.type === 'exists'
                            ? 'Must exist'
                            : `${claim.type} ${claim.value}`
                    }
                  </p>
                </div>
              </div>
              <Badge variant={claim.type === 'reveal' ? 'secondary' : 'outline'}>
                {claim.type === 'reveal' ? 'Reveal' : 'ZK Proof'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Response Section */}
      {isPending && (
        <>
          {/* Select Credential */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Credential</CardTitle>
              <CardDescription>
                Choose which credential to use for this verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matchingCredentials.length === 0 ? (
                <div className="text-center py-6">
                  <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    You don&apos;t have any matching credentials for this request
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchingCredentials.map((cred) => (
                    <div
                      key={cred.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedCredentialId === cred.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedCredentialId(cred.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{cred.schemaName}</p>
                          <p className="text-sm text-muted-foreground">
                            Issued {new Date(cred.issuedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {selectedCredentialId === cred.id && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Field Disclosure */}
          {selectedCredentialId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Field Disclosure</CardTitle>
                <CardDescription>
                  Review which fields will be shared with the verifier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.claims.map((claim, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {claim.type === 'reveal' ? (
                        <Eye className="w-4 h-4 text-warning" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="capitalize">
                        {claim.field.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                    <Badge variant={claim.type === 'reveal' ? 'secondary' : 'outline'}>
                      {claim.type === 'reveal' ? 'Value Shared' : 'Only Proof'}
                    </Badge>
                  </div>
                ))}

                <div className="pt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>ZK Proofs:</strong> The verifier will only see true/false results, not your actual data.
                    <br />
                    <strong>Reveal:</strong> The verifier will see the actual value of this field.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              className="flex-1" 
              onClick={handleApprove}
              disabled={responding || !selectedCredentialId}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {responding ? 'Processing...' : 'Approve'}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleReject}
              disabled={responding}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </>
      )}

      {/* Already Responded */}
      {!isPending && !isExpired && (
        <Card className={request.status === 'approved' ? 'border-primary/50' : 'border-destructive/50'}>
          <CardContent className="flex items-center gap-4 py-6">
            {request.status === 'approved' ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Request Approved</p>
                  <p className="text-sm text-muted-foreground">
                    You approved this request on {new Date(request.respondedAt!).toLocaleDateString()}
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8 text-destructive" />
                <div>
                  <p className="font-medium">Request Rejected</p>
                  <p className="text-sm text-muted-foreground">
                    You rejected this request on {new Date(request.respondedAt!).toLocaleDateString()}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
