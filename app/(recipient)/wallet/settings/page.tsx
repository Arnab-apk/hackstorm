import { SettingsPanel } from '@/components/shared/settings-panel';

export default function WalletSettingsPage() {
  return (
    <SettingsPanel
      portalName="Wallet"
      description="Manage your connected identity, display preferences, and wallet workspace options."
      capabilities={[
        'View assigned credentials',
        'Claim credentials',
        'Create selective share links',
        'Respond to verification requests',
      ]}
    />
  );
}
