import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <Label htmlFor="option3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" disabled>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="r-option1" />
        <Label htmlFor="r-option1">Option 1 (sélectionnée)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="r-option2" />
        <Label htmlFor="r-option2">Option 2</Label>
      </div>
    </RadioGroup>
  ),
};

export const PaymentMethod: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <Label>Méthode de paiement</Label>
      <RadioGroup defaultValue="card">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card">Carte bancaire</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="mobile" id="mobile" />
          <Label htmlFor="mobile">Mobile Money</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bank" id="bank" />
          <Label htmlFor="bank">Virement bancaire</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cash" id="cash" />
          <Label htmlFor="cash">Paiement à la livraison</Label>
        </div>
      </RadioGroup>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="w-[450px] space-y-4">
      <Label>Plan d'abonnement</Label>
      <RadioGroup defaultValue="standard">
        <div className="flex items-start space-x-3 p-3 border rounded-lg">
          <RadioGroupItem value="basic" id="basic" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="basic" className="font-semibold">
              Basic
            </Label>
            <p className="text-sm text-muted-foreground">
              Accès aux fonctionnalités de base - 10 000 FCFA/mois
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 border rounded-lg border-primary bg-primary/5">
          <RadioGroupItem value="standard" id="standard" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="standard" className="font-semibold">
              Standard
            </Label>
            <p className="text-sm text-muted-foreground">
              Toutes les fonctionnalités + support - 25 000 FCFA/mois
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 border rounded-lg">
          <RadioGroupItem value="premium" id="premium" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="premium" className="font-semibold">
              Premium
            </Label>
            <p className="text-sm text-muted-foreground">
              Accès illimité + priorité support - 50 000 FCFA/mois
            </p>
          </div>
        </div>
      </RadioGroup>
    </div>
  ),
};

export const KYCDocumentType: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <Label>Type de document d'identité</Label>
      <RadioGroup defaultValue="cni">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cni" id="cni" />
          <Label htmlFor="cni">Carte Nationale d'Identité (CNI)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="passport" id="passport" />
          <Label htmlFor="passport">Passeport</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="permit" id="permit" />
          <Label htmlFor="permit">Titre de séjour</Label>
        </div>
      </RadioGroup>
    </div>
  ),
};
