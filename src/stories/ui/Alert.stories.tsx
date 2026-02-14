import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'Le style visuel de l\'alerte',
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const AlertIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export const Default: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <InfoIcon />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        Votre session expire dans 5 minutes. Veuillez sauvegarder votre travail.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-[400px]">
      <AlertIcon />
      <AlertTitle>Erreur</AlertTitle>
      <AlertDescription>
        Une erreur s'est produite lors de la sauvegarde. Veuillez réessayer.
      </AlertDescription>
    </Alert>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <AlertTitle>Notification</AlertTitle>
      <AlertDescription>
        Votre profil a été mis à jour avec succès.
      </AlertDescription>
    </Alert>
  ),
};

export const SimpleMessage: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <AlertDescription>
        Ceci est une alerte simple sans titre.
      </AlertDescription>
    </Alert>
  ),
};

export const KYCAlert: Story = {
  render: () => (
    <Alert className="w-[500px] border-yellow-500 bg-yellow-50">
      <InfoIcon />
      <AlertTitle>Vérification KYC requise</AlertTitle>
      <AlertDescription>
        Pour accéder à cette fonctionnalité, vous devez compléter votre niveau KYC Standard.
        Veuillez télécharger les documents requis dans la section KYC & Conformité.
      </AlertDescription>
    </Alert>
  ),
};

export const SuccessAlert: Story = {
  render: () => (
    <Alert className="w-[450px] border-green-500 bg-green-50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-green-600"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      <AlertTitle className="text-green-800">Commande confirmée</AlertTitle>
      <AlertDescription className="text-green-700">
        Votre commande #12345 a été confirmée et sera traitée dans les prochaines 24h.
      </AlertDescription>
    </Alert>
  ),
};

export const WarningAlert: Story = {
  render: () => (
    <Alert className="w-[450px] border-orange-500 bg-orange-50">
      <AlertIcon />
      <AlertTitle className="text-orange-800">Action requise</AlertTitle>
      <AlertDescription className="text-orange-700">
        Votre abonnement arrive à expiration dans 7 jours. Renouvelez-le maintenant pour continuer à bénéficier de tous les services.
      </AlertDescription>
    </Alert>
  ),
};

export const MultipleAlerts: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <Alert className="border-green-500 bg-green-50">
        <AlertDescription className="text-green-700">
          Document vérifié avec succès
        </AlertDescription>
      </Alert>
      <Alert className="border-yellow-500 bg-yellow-50">
        <AlertDescription className="text-yellow-700">
          En attente de validation
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertDescription>
          Document rejeté - informations manquantes
        </AlertDescription>
      </Alert>
    </div>
  ),
};
