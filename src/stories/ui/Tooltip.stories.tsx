import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Info, HelpCircle, Settings, Bell, User, Package, GraduationCap, FileCheck } from 'lucide-react';

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Survolez-moi</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Ceci est une info-bulle</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Plus d'informations</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const KYCStatus: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <FileCheck className="h-4 w-4 text-green-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Vérification KYC approuvée</p>
          <p className="text-xs text-muted-foreground">Validée le 15 décembre 2024</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const MarketplaceActions: Story = {
  render: () => (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <Package className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Voir les produits</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Paramètres du vendeur</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Notifications de commandes</p>
          <p className="text-xs text-muted-foreground">3 nouvelles</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const FormationProgress: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">
          <GraduationCap className="h-4 w-4 mr-2" />
          Ma formation
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">Gestion financière pour PME</p>
        <p className="text-sm">Progression: 65%</p>
        <p className="text-xs text-muted-foreground">4 modules restants</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const ProfileInfo: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">PME Ivoirienne SARL</p>
        <p className="text-sm">Membre Premium</p>
        <p className="text-xs text-muted-foreground">Inscription: Janvier 2024</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const HelpTooltip: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span className="text-sm">Besoin d'aide?</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Contactez notre support</p>
          <p className="text-xs text-muted-foreground">support@cpu-pme.ci</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const MultipleTooltips: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">En haut</Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Info-bulle en haut</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">À droite</Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Info-bulle à droite</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">En bas</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Info-bulle en bas</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">À gauche</Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Info-bulle à gauche</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  ),
};

export const WithDetailedInfo: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Statistiques</Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-2">
          <p className="font-semibold">Performance du mois</p>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Ventes:</span>
              <span className="font-semibold">156</span>
            </div>
            <div className="flex justify-between">
              <span>Revenus:</span>
              <span className="font-semibold">2,450,000 XOF</span>
            </div>
            <div className="flex justify-between">
              <span>Nouveaux clients:</span>
              <span className="font-semibold">42</span>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
};

export const StatusIndicator: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm">En ligne</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connecté depuis 2h</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="text-sm">Absent</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>De retour à 14h00</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="h-3 w-3 rounded-full bg-gray-500" />
            <span className="text-sm">Hors ligne</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Dernière connexion: il y a 3 jours</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};
