'use client';

import useSWR from 'swr';

interface VerificationRequest {
  id: string;
  verifierId: string;
  verifierDID: string;
  verifierName: string;
  verifierType: string;
  verifierVerified: boolean;
  targetAddress: string;
  credentialType: string;
  claims: Array<{
    field: string;
    type: 'equals' | 'greaterThan' | 'lessThan' | 'greaterOrEqual' | 'contains' | 'exists' | 'reveal';
    value?: string | number;
  }>;
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
}

interface VerificationResponse {
  id: string;
  requestId: string;
  credentialId: string;
  proofs: Array<{
    claim: string;
    type: 'comparison' | 'revealed';
    result?: boolean;
    value?: string | number;
  }>;
  merkleProofValid: boolean;
  anchoredOnChain: boolean;
  anchorTxHash: string;
  notRevoked: boolean;
  respondedAt: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

// Hook for recipient's pending requests
export function useRecipientRequests(status?: 'pending' | 'approved' | 'rejected') {
  const url = status
    ? `/api/recipient/requests?status=${status}`
    : '/api/recipient/requests';
  
  return useSWR<{ requests: VerificationRequest[]; counts: Record<string, number> }>(url, fetcher);
}

// Hook for verifier's requests
export function useVerifierRequests(status?: 'pending' | 'approved' | 'rejected' | 'expired') {
  const url = status
    ? `/api/verifier/requests?status=${status}`
    : '/api/verifier/requests';
  
  return useSWR<{ requests: VerificationRequest[]; counts: Record<string, number> }>(url, fetcher);
}

// Hook for single request detail
export function useRequest(id: string, role: 'recipient' | 'verifier') {
  const url = role === 'recipient'
    ? `/api/recipient/requests/${id}`
    : `/api/verifier/requests/${id}`;
  
  return useSWR<{ request: VerificationRequest; response?: VerificationResponse }>(url, fetcher);
}

// Hook for creating verification request (verifier)
export function useCreateRequest() {
  const create = async (data: {
    targetAddress: string;
    credentialType: string;
    claims: VerificationRequest['claims'];
    message?: string;
    expiresInDays?: number;
  }) => {
    const response = await fetch('/api/verifier/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create request');
    }
    
    return response.json();
  };

  return { create };
}

// Hook for responding to request (recipient)
export function useRespondToRequest() {
  const respond = async (
    requestId: string, 
    action: 'approve' | 'reject',
    data?: {
      credentialId: string;
      disclosedFields: string[];
    }
  ) => {
    const response = await fetch(`/api/recipient/requests/${requestId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to respond to request');
    }
    
    return response.json();
  };

  return { respond };
}
