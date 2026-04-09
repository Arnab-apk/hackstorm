'use client';

import * as React from 'react';
import { cn, formatDate, truncateDID } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Award, ExternalLink, Shield, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface CredentialCardProps {
  credential: {
    id: string;
    schemaId: string;
    schemaName: string;
    issuerName: string;
    issuerDID: string;
    recipientName?: string;
    recipientEmail?: string;
    issuedAt: string;
    claimed: boolean;
    claimedAt?: string;
    revoked: boolean;
    revokedAt?: string;
  };
  variant?: 'default' | 'compact';
  onClick?: () => void;
  showRecipient?: boolean;
}

function CredentialCard({
  credential,
  variant = 'default',
  onClick,
  showRecipient = false,
}: CredentialCardProps) {
  const getStatus = () => {
    if (credential.revoked) {
      return { label: 'Revoked', variant: 'destructive' as const, icon: XCircle };
    }
    if (credential.claimed) {
      return { label: 'Claimed', variant: 'success' as const, icon: CheckCircle2 };
    }
    return { label: 'Pending', variant: 'warning' as const, icon: Clock };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card text-left transition-all duration-200',
          onClick && 'hover:border-primary/30 hover:bg-card/80 cursor-pointer'
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Award className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{credential.schemaName}</p>
          <p className="text-sm text-muted-foreground truncate">{credential.issuerName}</p>
        </div>
        <Badge variant={status.variant}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'credential-card w-full text-left',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Header */}
      <div className="relative p-6 pb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
        
        <div className="flex items-start justify-between relative">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Award className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{credential.schemaName}</h3>
              <p className="text-sm text-muted-foreground">{credential.issuerName}</p>
            </div>
          </div>
          <Badge variant={status.variant}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Details */}
      <div className="px-6 pb-6 space-y-4">
        {showRecipient && credential.recipientName && (
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Recipient</span>
            <span className="text-sm font-medium">{credential.recipientName}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between py-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Issued</span>
          <span className="text-sm font-medium">{formatDate(credential.issuedAt)}</span>
        </div>

        {credential.claimed && credential.claimedAt && (
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Claimed</span>
            <span className="text-sm font-medium">{formatDate(credential.claimedAt)}</span>
          </div>
        )}

        <div className="flex items-center justify-between py-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Issuer DID</span>
          <span className="text-xs font-mono text-muted-foreground">
            {truncateDID(credential.issuerDID)}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Blockchain Verified</span>
          </div>
          {onClick && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <span>View Details</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export { CredentialCard };
