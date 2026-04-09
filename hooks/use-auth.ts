'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';

interface User {
  walletAddress: string;
  did: string;
  email?: string;
  role: 'issuer' | 'verifier' | 'user';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch');
    throw error;
  }
  const json = await res.json();
  return json.data || json;
};

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<{ address: string; did: string; role: string; email?: string } | null>('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const user: User | null = data?.address ? {
    walletAddress: data.address,
    did: data.did,
    email: data.email,
    role: data.role as User['role'],
  } : null;

  const login = useCallback(async (idToken: string, provider: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, provider }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result = await response.json();
      await mutate();
      return result;
    } catch (err) {
      throw err;
    }
  }, [mutate]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await mutate(null, false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [mutate]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error: error?.message || null,
    login,
    logout,
    refresh: mutate,
  };
}
