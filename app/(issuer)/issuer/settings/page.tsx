import { SettingsPanel } from '@/components/shared/settings-panel';

export default function IssuerSettingsPage() {
  return (
    <SettingsPanel
      portalName="Issuer"
      description="Review issuer identity details and configure the credential issuing workspace."
      capabilities={[
        'Issue single credentials',
        'Issue batch credentials',
        'View issued credentials',
        'Revoke credentials',
      ]}
    />
  );
}
