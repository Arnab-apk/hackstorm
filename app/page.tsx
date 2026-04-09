/**
 * API-Only Backend
 * 
 * This is a backend-only service. The frontend is built separately.
 * Access the API endpoints at /api/*
 */

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Verifiable Credentials API</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Backend service for decentralized credential issuance, verification, and management.
        </p>
        
        <div className="grid gap-4 text-left">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Health Check</h2>
            <code className="text-sm bg-muted px-2 py-1 rounded">GET /api/health</code>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Authentication</h2>
            <code className="text-sm bg-muted px-2 py-1 rounded">POST /api/auth/login</code>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Issuer APIs</h2>
            <code className="text-sm bg-muted px-2 py-1 rounded">/api/issuer/*</code>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Recipient APIs</h2>
            <code className="text-sm bg-muted px-2 py-1 rounded">/api/recipient/*</code>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Verifier APIs</h2>
            <code className="text-sm bg-muted px-2 py-1 rounded">/api/verifier/*</code>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Public Verification</h2>
            <code className="text-sm bg-muted px-2 py-1 rounded">/api/verify/*</code>
          </div>
        </div>
      </div>
    </main>
  );
}
