/**
 * Health Check API
 * GET /api/health
 * 
 * Returns the health status of backend services (MongoDB only).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

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

  // Check required environment variables
  const requiredEnvVars = [
    'MONGODB_URI',
    'ISSUER_PRIVATE_KEY',
    'ISSUER_PUBLIC_KEY',
    'ISSUER_DID',
    'JWT_SECRET',
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
