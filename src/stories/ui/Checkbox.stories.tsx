import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

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
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accepter les termes et conditions</Label>
    </div>
  ),
};

export const MultipleOptions: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="option1" defaultChecked />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option3" />
        <Label htmlFor="option3">Option 3</Label>
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div>
        <h3 className="mb-4 text-sm font-medium">Préférences de notification</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="email" defaultChecked />
            <Label htmlFor="email">Notifications par email</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="sms" />
            <Label htmlFor="sms">Notifications par SMS</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="push" defaultChecked />
            <Label htmlFor="push">Notifications push</Label>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="flex items-start space-x-3">
        <Checkbox id="marketing" className="mt-1" />
        <div className="space-y-1">
          <Label htmlFor="marketing">Marketing emails</Label>
          <p className="text-sm text-muted-foreground">
            Recevoir des emails sur les nouveaux produits et offres spéciales.
          </p>
        </div>
      </div>
    </div>
  ),
};
