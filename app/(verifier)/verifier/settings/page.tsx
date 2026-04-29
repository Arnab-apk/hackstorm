import { SettingsPanel } from '@/components/shared/settings-panel';

export default function VerifierSettingsPage() {
  return (
    <SettingsPanel
      portalName="Verifier"
      description="Review verifier identity details and tune the verification workspace."
      capabilities={[
        'Create verification requests',
        'View verification responses',
        'Verify shared credentials',
        'Maintain verifier profile',
      ]}
    />
  );
}
