import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Le style visuel du badge',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="default">En ligne</Badge>
      <Badge variant="secondary">En attente</Badge>
      <Badge variant="destructive">Hors ligne</Badge>
      <Badge variant="outline">Brouillon</Badge>
    </div>
  ),
};

export const NotificationBadge: Story = {
  render: () => (
    <div className="inline-flex items-center gap-2">
      <span>Messages</span>
      <Badge variant="destructive">3</Badge>
    </div>
  ),
};

export const CategoryBadges: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap max-w-md">
      <Badge>Agriculture</Badge>
      <Badge>Industrie</Badge>
      <Badge>Commerce</Badge>
      <Badge variant="secondary">Services</Badge>
      <Badge variant="secondary">Technologie</Badge>
      <Badge variant="outline">Énergie</Badge>
    </div>
  ),
};

export const KYCLevels: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge className="bg-yellow-500 hover:bg-yellow-600">KYC Minimum</Badge>
        <span className="text-sm text-muted-foreground">Niveau de base</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-blue-500 hover:bg-blue-600">KYC Standard</Badge>
        <span className="text-sm text-muted-foreground">Niveau intermédiaire</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-green-500 hover:bg-green-600">KYC Renforcé</Badge>
        <span className="text-sm text-muted-foreground">Niveau avancé</span>
      </div>
    </div>
  ),
};
