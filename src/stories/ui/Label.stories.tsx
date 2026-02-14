import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="nom@exemple.com" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accepter les termes et conditions</Label>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="name">
        Nom complet <span className="text-destructive">*</span>
      </Label>
      <Input id="name" placeholder="Jean Dupont" />
    </div>
  ),
};

export const FormLabels: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company">Nom de l'entreprise</Label>
        <Input id="company" placeholder="CPU-PME" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sector">Secteur d'activité</Label>
        <Input id="sector" placeholder="Commerce" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="employees">Nombre d'employés</Label>
        <Input id="employees" type="number" placeholder="10" />
      </div>
    </div>
  ),
};
