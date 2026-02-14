import type { Meta, StoryObj } from '@storybook/react';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/InputOTP',
  component: InputOTP,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label>Code de vérification</Label>
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const TwoFactor: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp">Code d'authentification à 2 facteurs</Label>
        <p className="text-sm text-muted-foreground">
          Entrez le code à 6 chiffres de votre application d'authentification
        </p>
      </div>
      <InputOTP maxLength={6} id="otp">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  ),
};

export const SMSVerification: Story = {
  render: () => (
    <div className="w-[400px] space-y-4 p-6 border rounded-lg">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Vérifiez votre numéro</h3>
        <p className="text-sm text-muted-foreground">
          Un code à 6 chiffres a été envoyé au +225 XX XX XX XX
        </p>
      </div>
      <div className="flex justify-center">
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <p className="text-sm text-center text-muted-foreground">
        Vous n'avez pas reçu le code ?{' '}
        <button className="text-primary underline">Renvoyer</button>
      </p>
    </div>
  ),
};

export const FourDigit: Story = {
  render: () => (
    <div className="space-y-2">
      <Label>Code PIN</Label>
      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  ),
};

export const PaymentVerification: Story = {
  render: () => (
    <div className="w-[450px] space-y-6 p-6 border rounded-lg">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Confirmer le paiement</h3>
        <p className="text-sm text-muted-foreground">
          Montant: <span className="font-semibold">25 000 FCFA</span>
        </p>
      </div>
      <div className="space-y-2">
        <Label>Code de vérification Mobile Money</Label>
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p className="text-xs text-muted-foreground">
          Un code a été envoyé à votre numéro mobile
        </p>
      </div>
    </div>
  ),
};
