import { NextRequest } from 'next/server';
import { requireIssuer } from '@/lib/auth';
import { successResponse, notFound, handleError } from '@/lib/response';
import { getSchema } from '@/lib/schemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/issuer/schemas/[id]
 * Get a specific credential schema
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireIssuer();
    const { id } = await params;

    const schema = getSchema(id);

    if (!schema) {
      return notFound('Schema');
    }

    return successResponse({ schema });
  } catch (error) {
    return handleError(error);
  }
}
