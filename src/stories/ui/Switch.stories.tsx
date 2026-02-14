import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Mode avion</Label>
    </div>
  ),
};

export const SettingsPanel: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="notifications">Notifications</Label>
        <Switch id="notifications" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="marketing">Marketing emails</Label>
        <Switch id="marketing" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="security">Alertes de sécurité</Label>
        <Switch id="security" defaultChecked />
      </div>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 space-y-1">
          <Label htmlFor="analytics">Statistiques d'utilisation</Label>
          <p className="text-sm text-muted-foreground">
            Collecter des données anonymes pour améliorer le service
          </p>
        </div>
        <Switch id="analytics" />
      </div>
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 space-y-1">
          <Label htmlFor="newsletter">Newsletter hebdomadaire</Label>
          <p className="text-sm text-muted-foreground">
            Recevoir un résumé des actualités chaque semaine
          </p>
        </div>
        <Switch id="newsletter" defaultChecked />
      </div>
    </div>
  ),
};

export const KYCSettings: Story = {
  render: () => (
    <div className="w-[400px] space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Paramètres KYC</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-verify">Vérification automatique</Label>
          <Switch id="auto-verify" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="notify-expiry">Notifier avant expiration</Label>
          <Switch id="notify-expiry" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="strict-mode">Mode strict</Label>
          <Switch id="strict-mode" />
        </div>
      </div>
    </div>
  ),
};
