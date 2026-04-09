'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Trash2,
  Send,
  User,
  FileText,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { useCreateRequest } from '@/hooks/use-requests';
import { toast } from 'sonner';

interface Claim {
  field: string;
  type: 'equals' | 'greaterThan' | 'lessThan' | 'greaterOrEqual' | 'contains' | 'exists' | 'reveal';
  value?: string | number;
}

const CREDENTIAL_TYPES = [
  { id: 'university-degree', name: 'University Degree' },
  { id: 'employee-id', name: 'Employee ID' },
  { id: 'professional-cert', name: 'Professional Certification' },
  { id: 'event-ticket', name: 'Event Ticket' },
];

const CLAIM_TYPES = [
  { value: 'reveal', label: 'Reveal Value' },
  { value: 'equals', label: 'Equals' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'lessThan', label: 'Less Than' },
  { value: 'greaterOrEqual', label: 'Greater or Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'exists', label: 'Exists' },
];

export default function NewRequestPage() {
  const router = useRouter();
  const { create } = useCreateRequest();
  
  const [loading, setLoading] = useState(false);
  const [targetAddress, setTargetAddress] = useState('');
  const [credentialType, setCredentialType] = useState('');
  const [claims, setClaims] = useState<Claim[]>([{ field: '', type: 'reveal' }]);
  const [message, setMessage] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);

  const addClaim = () => {
    setClaims([...claims, { field: '', type: 'reveal' }]);
  };

  const removeClaim = (index: number) => {
    setClaims(claims.filter((_, i) => i !== index));
  };

  const updateClaim = (index: number, updates: Partial<Claim>) => {
    setClaims(claims.map((claim, i) => 
      i === index ? { ...claim, ...updates } : claim
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetAddress || !credentialType || claims.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const validClaims = claims.filter(c => c.field);
    if (validClaims.length === 0) {
      toast.error('Please add at least one claim');
      return;
    }

    setLoading(true);
    try {
      await create({
        targetAddress,
        credentialType,
        claims: validClaims,
        message: message || undefined,
        expiresInDays: expiryDays,
      });
      
      toast.success('Verification request sent!');
      router.push('/verifier/requests');
    } catch (err) {
      toast.error('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader 
          title="New Verification Request"
          description="Request credential verification from a user"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Target User */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              Target User
            </CardTitle>
            <CardDescription>
              Enter the wallet address of the credential holder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address</Label>
              <Input
                id="address"
                placeholder="0x..."
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Credential Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              Credential Type
            </CardTitle>
            <CardDescription>
              Select the type of credential you want to verify
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={credentialType}
              onValueChange={setCredentialType}
              options={CREDENTIAL_TYPES.map((type) => ({
                value: type.id,
                label: type.name,
              }))}
              placeholder="Select credential type"
            />
          </CardContent>
        </Card>

        {/* Claims */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  Verification Claims
                </CardTitle>
                <CardDescription>
                  Define what you want to verify
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addClaim}>
                <Plus className="w-4 h-4 mr-1" />
                Add Claim
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {claims.map((claim, index) => (
              <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Claim {index + 1}</span>
                  {claims.length > 1 && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => removeClaim(index)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Field Name</Label>
                    <Input
                      placeholder="e.g., gpa, degree"
                      value={claim.field}
                      onChange={(e) => updateClaim(index, { field: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Verification Type</Label>
                    <Select 
                      value={claim.type} 
                      onValueChange={(value) => updateClaim(index, { type: value as Claim['type'] })}
                      options={CLAIM_TYPES.map((type) => ({
                        value: type.value,
                        label: type.label,
                      }))}
                    />
                  </div>
                </div>

                {claim.type !== 'reveal' && claim.type !== 'exists' && (
                  <div className="space-y-2">
                    <Label>Comparison Value</Label>
                    <Input
                      placeholder="Enter value to compare"
                      value={claim.value?.toString() || ''}
                      onChange={(e) => updateClaim(index, { value: e.target.value })}
                    />
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {claim.type === 'reveal' 
                    ? 'The user will share the actual value of this field'
                    : 'The user will provide a ZK proof without revealing the actual value'
                  }
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Additional Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Explain why you need this verification..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Request Expiry (days)</Label>
              <Input
                id="expiry"
                type="number"
                min={1}
                max={30}
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          <Send className="w-4 h-4 mr-2" />
          {loading ? 'Sending Request...' : 'Send Verification Request'}
        </Button>
      </form>
    </div>
  );
}
