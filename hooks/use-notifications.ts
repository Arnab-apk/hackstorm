'use client';

import useSWR from 'swr';

interface Notification {
  id: string;
  type: 'credential_issued' | 'credential_claimed' | 'credential_revoked' | 'verification_request' | 'verification_approved' | 'verification_rejected';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch notifications');
  }
  const json = await res.json();
  return json.data || json;
};

export function useNotifications(role: 'recipient' | 'verifier') {
  const url = role === 'recipient'
    ? '/api/recipient/notifications'
    : '/api/verifier/notifications';
  
  const { data, error, isLoading, mutate } = useSWR<{
    notifications: Notification[];
    unreadCount: number;
  }>(url, fetcher, {
    refreshInterval: 30000, // Poll every 30 seconds
  });

  const markAsRead = async (notificationId: string) => {
    const response = await fetch(
      role === 'recipient'
        ? `/api/recipient/notifications/${notificationId}`
        : `/api/verifier/notifications/${notificationId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      }
    );

    if (response.ok) {
      await mutate();
    }
  };

  const markAllAsRead = async () => {
    const response = await fetch(
      role === 'recipient'
        ? '/api/recipient/notifications'
        : '/api/verifier/notifications',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readAll: true }),
      }
    );

    if (response.ok) {
      await mutate();
    }
  };

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: mutate,
  };
}
