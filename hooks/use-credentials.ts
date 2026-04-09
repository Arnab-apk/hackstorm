'use client';

import useSWR from 'swr';

interface Credential {
  id: string;
  batchId: string;
  schemaId: string;
  schemaName: string;
  recipientEmail: string;
  recipientAddress: string;
  claimed: boolean;
  claimedAt: string | null;
  revoked: boolean;
  revokedAt: string | null;
  issuedAt: string;
  ipfsCID: string;
  credentialJSON?: Record<string, unknown>;
}

interface CredentialsResponse {
  credentials: Credential[];
  counts: {
    total: number;
    claimed: number;
    unclaimed: number;
    revoked: number;
  };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch credentials');
  }
  return res.json();
};

// Hook for issuer credentials
export function useIssuerCredentials(filters?: {
  status?: 'claimed' | 'unclaimed' | 'revoked';
  schemaId?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.schemaId) params.set('schemaId', filters.schemaId);
  if (filters?.search) params.set('search', filters.search);
  
  const url = `/api/issuer/credentials${params.toString() ? `?${params}` : ''}`;
  
  return useSWR<CredentialsResponse>(url, fetcher);
}

// Hook for recipient credentials
export function useRecipientCredentials(status?: 'claimed' | 'unclaimed' | 'revoked') {
  const url = status 
    ? `/api/recipient/credentials?status=${status}`
    : '/api/recipient/credentials';
  
  return useSWR<CredentialsResponse>(url, fetcher);
}

// Hook for single credential
export function useCredential(id: string, role: 'issuer' | 'recipient') {
  const url = role === 'issuer' 
    ? `/api/issuer/credentials/${id}`
    : `/api/recipient/credentials/${id}`;
  
  return useSWR<{ credential: Credential }>(url, fetcher);
}

// Hook for claiming credential
export function useClaimCredential() {
  const claim = async (credentialId: string) => {
    const response = await fetch(`/api/recipient/credentials/${credentialId}/claim`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to claim credential');
    }
    
    return response.json();
  };

  return { claim };
}

// Hook for revoking credential
export function useRevokeCredential() {
  const revoke = async (credentialId: string, reason: string) => {
    const response = await fetch('/api/issuer/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credentialId, reason }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to revoke credential');
    }
    
    return response.json();
  };

  return { revoke };
}
