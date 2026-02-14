import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '@/components/ui/progress';

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'La valeur de progression (0-100)',
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
    className: 'w-[400px]',
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    className: 'w-[400px]',
  },
};

export const Complete: Story = {
  args: {
    value: 100,
    className: 'w-[400px]',
  },
};

export const FormationProgress: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Gestion financière pour PME</span>
          <span className="text-muted-foreground">65%</span>
        </div>
        <Progress value={65} />
        <p className="text-xs text-muted-foreground mt-1">4 modules sur 10 complétés</p>
      </div>
    </div>
  ),
};

export const KYCVerification: Story = {
  render: () => (
    <div className="w-[500px] space-y-6">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Vérification KYC</span>
          <span className="text-muted-foreground">75%</span>
        </div>
        <Progress value={75} />
        <p className="text-xs text-muted-foreground mt-1">3 sur 4 documents validés</p>
      </div>
    </div>
  ),
};

export const MultipleProgress: Story = {
  render: () => (
    <div className="w-[500px] space-y-6">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Profil complété</span>
          <span className="text-muted-foreground">90%</span>
        </div>
        <Progress value={90} />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Documents KYC</span>
          <span className="text-muted-foreground">75%</span>
        </div>
        <Progress value={75} />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Formations en cours</span>
          <span className="text-muted-foreground">45%</span>
        </div>
        <Progress value={45} />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Catalogueproduits</span>
          <span className="text-muted-foreground">60%</span>
        </div>
        <Progress value={60} />
      </div>
    </div>
  ),
};

export const UploadProgress: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Téléchargement: CNI_123456789.pdf</span>
          <span className="text-muted-foreground">35%</span>
        </div>
        <Progress value={35} />
        <p className="text-xs text-muted-foreground mt-1">1.8 MB sur 5.0 MB</p>
      </div>
    </div>
  ),
};

export const OrderProgress: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Commande #CMD-2024-1234</span>
          <span className="text-muted-foreground">50%</span>
        </div>
        <Progress value={50} />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Confirmée</span>
          <span>En cours</span>
          <span>Livrée</span>
        </div>
      </div>
    </div>
  ),
};

export const MembershipLevel: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Progression vers Premium</span>
          <span className="text-muted-foreground">8,500 / 10,000 points</span>
        </div>
        <Progress value={85} />
        <p className="text-xs text-muted-foreground mt-1">Plus que 1,500 points!</p>
      </div>
    </div>
  ),
};

export const GoalProgress: Story = {
  render: () => (
    <div className="w-[500px] space-y-6">
      <h3 className="font-semibold">Objectifs du mois</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Ventes</span>
            <span className="text-muted-foreground">156 / 200</span>
          </div>
          <Progress value={78} />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Revenus</span>
            <span className="text-muted-foreground">2.45M / 3M XOF</span>
          </div>
          <Progress value={82} />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Nouveaux clients</span>
            <span className="text-muted-foreground">42 / 50</span>
          </div>
          <Progress value={84} />
        </div>
      </div>
    </div>
  ),
};
