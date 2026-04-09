/**
 * Health Check API
 * GET /api/health
 * 
 * Returns the health status of all backend services.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getPublicClient } from '@/lib/blockchain';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    name: string;
    status: 'up' | 'down';
    latency?: number;
    error?: string;
  }[];
}

export async function GET(request: NextRequest) {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: [],
  };

  // Check MongoDB
  try {
    const start = Date.now();
    const db = await getDatabase();
    await db.command({ ping: 1 });
    health.services.push({
      name: 'MongoDB',
      status: 'up',
      latency: Date.now() - start,
    });
  } catch (error) {
    health.services.push({
      name: 'MongoDB',
      status: 'down',
      error: error instanceof Error ? error.message : 'Connection failed',
    });
    health.status = 'unhealthy';
  }

  // Check Polygon RPC
  try {
    const start = Date.now();
    const client = getPublicClient();
    await client.getBlockNumber();
    health.services.push({
      name: 'Polygon RPC',
      status: 'up',
      latency: Date.now() - start,
    });
  } catch (error) {
    health.services.push({
      name: 'Polygon RPC',
      status: 'down',
      error: error instanceof Error ? error.message : 'Connection failed',
    });
    health.status = 'degraded';
  }

  // Check IPFS (Pinata)
  try {
    const start = Date.now();
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });
    if (response.ok) {
      health.services.push({
        name: 'IPFS (Pinata)',
        status: 'up',
        latency: Date.now() - start,
      });
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    health.services.push({
      name: 'IPFS (Pinata)',
      status: 'down',
      error: error instanceof Error ? error.message : 'Connection failed',
    });
    health.status = 'degraded';
  }

  // Check required environment variables
  const requiredEnvVars = [
    'MONGODB_URI',
    'POLYGON_RPC_URL',
    'CREDENTIAL_REGISTRY_CONTRACT',
    'ISSUER_PRIVATE_KEY',
    'ISSUER_PUBLIC_KEY',
    'ISSUER_DID',
  ];

  const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
  if (missingEnvVars.length > 0) {
    health.services.push({
      name: 'Environment',
      status: 'down',
      error: `Missing: ${missingEnvVars.join(', ')}`,
    });
    health.status = 'unhealthy';
  } else {
    health.services.push({
      name: 'Environment',
      status: 'up',
    });
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
