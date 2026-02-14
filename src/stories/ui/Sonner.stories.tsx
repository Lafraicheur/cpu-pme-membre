import type { Meta, StoryObj } from '@storybook/react';
import { Toaster, toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Sonner',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onClick={() =>
          toast('Message envoyé', {
            description: 'Votre message a été envoyé avec succès.',
          })
        }
      >
        Afficher une notification
      </Button>
    </div>
  ),
};

export const Success: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onClick={() =>
          toast.success('Commande confirmée!', {
            description: 'Votre commande #CMD-2024-1234 a été confirmée.',
          })
        }
      >
        Commande réussie
      </Button>
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        variant="destructive"
        onClick={() =>
          toast.error('Échec de la transaction', {
            description: 'Votre paiement n\'a pas pu être traité. Veuillez réessayer.',
          })
        }
      >
        Erreur
      </Button>
    </div>
  ),
};

export const Info: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        variant="outline"
        onClick={() =>
          toast.info('Nouvelle formation disponible', {
            description: 'Marketing digital pour PME - Inscription ouverte.',
          })
        }
      >
        Information
      </Button>
    </div>
  ),
};

export const Warning: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        variant="outline"
        onClick={() =>
          toast.warning('Stock faible', {
            description: 'Il ne reste que 5 unités de ce produit.',
          })
        }
      >
        Avertissement
      </Button>
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onClick={() =>
          toast('Produit ajouté au panier', {
            description: 'Café Arabica Premium - 10kg',
            action: {
              label: 'Voir le panier',
              onClick: () => console.log('Voir le panier'),
            },
          })
        }
      >
        Avec action
      </Button>
    </div>
  ),
};

export const KYCApproved: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onClick={() =>
          toast.success('Vérification KYC approuvée!', {
            description: 'Votre compte a été vérifié avec succès.',
            action: {
              label: 'Voir le profil',
              onClick: () => console.log('Voir le profil'),
            },
          })
        }
      >
        KYC Approuvée
      </Button>
    </div>
  ),
};

export const OrderNotification: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toaster />
      <Button
        onClick={() =>
          toast.success('Nouvelle commande!', {
            description: 'Commande #CMD-2024-1234 - 230,000 XOF',
            action: {
              label: 'Voir',
              onClick: () => console.log('Voir commande'),
            },
          })
        }
      >
        Nouvelle commande
      </Button>
    </div>
  ),
};

export const MultipleToasts: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toaster />
      <Button
        onClick={() => {
          toast.success('Produit ajouté');
          setTimeout(() => toast.info('Profil complété à 90%'), 1000);
          setTimeout(() => toast.warning('Votre session expire dans 5 minutes'), 2000);
        }}
      >
        Plusieurs notifications
      </Button>
    </div>
  ),
};
