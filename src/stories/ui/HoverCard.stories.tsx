import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, MapPin, Building2, Star } from 'lucide-react';

const meta = {
  title: 'UI/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@pme_ivoirienne</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarFallback>PI</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">PME Ivoirienne</h4>
            <p className="text-sm">Spécialiste en produits agricoles locaux</p>
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-muted-foreground">
                Membre depuis janvier 2024
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const SellerProfile: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-sm">
        Vendeur:{' '}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="p-0 h-auto font-normal">
              PME Ivoirienne SARL
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>PI</AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <div>
                  <h4 className="text-sm font-semibold">PME Ivoirienne SARL</h4>
                  <p className="text-xs text-muted-foreground">@pme_ivoirienne</p>
                </div>
                <p className="text-sm">
                  Production et transformation de café et cacao ivoirien premium
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span>156 produits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>4.8/5</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Abidjan, Côte d'Ivoire</span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </p>
    </div>
  ),
};

export const ProductPreview: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">Café Arabica Premium</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Café Arabica Premium</h4>
            <p className="text-xs text-muted-foreground">Produit par PME Ivoirienne</p>
          </div>
          <p className="text-sm">
            Café Arabica cultivé dans les montagnes de l'ouest ivoirien, torréfié artisanalement
            pour un arôme unique.
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Prix:</span>
              <span className="ml-2 font-semibold">15,000 XOF/kg</span>
            </div>
            <div>
              <span className="text-muted-foreground">Stock:</span>
              <span className="ml-2 font-semibold">45 kg</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">4.9</span>
            <span className="text-muted-foreground">(127 avis)</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const FormationPreview: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">Gestion financière pour PME</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-96">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Gestion financière pour PME</h4>
            <p className="text-xs text-muted-foreground">Formation certifiante</p>
          </div>
          <p className="text-sm">
            Maîtrisez les fondamentaux de la gestion financière adaptés aux PME ivoiriennes.
            Comptabilité, budget, trésorerie et reporting.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Durée</div>
              <div className="font-medium">6 semaines</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Niveau</div>
              <div className="font-medium">Intermédiaire</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Prix</div>
              <div className="font-medium">45,000 XOF</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Participants</div>
              <div className="font-medium">245</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">4.7</span>
            <span className="text-muted-foreground">(89 évaluations)</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const MemberInfo: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="sm">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarFallback className="text-xs">AM</AvatarFallback>
          </Avatar>
          Amadou Koné
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <div className="space-y-2 flex-1">
            <div>
              <h4 className="text-sm font-semibold">Amadou Koné</h4>
              <p className="text-xs text-muted-foreground">Directeur Général</p>
            </div>
            <p className="text-xs">PME Ivoirienne SARL</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                <span>Membre depuis Jan 2024</span>
              </div>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">KYC:</span>
              <span className="ml-1 text-green-600 font-medium">Vérifié</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const StatisticsCard: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline">Voir les stats</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Statistiques du mois</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenus totaux</span>
              <span className="font-semibold">2,450,000 XOF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre de ventes</span>
              <span className="font-semibold">156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nouveaux clients</span>
              <span className="font-semibold">42</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taux de satisfaction</span>
              <span className="font-semibold">96%</span>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              +23% par rapport au mois dernier
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const CertificatePreview: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">Certificat de formation</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Certificat de réussite</h4>
            <p className="text-xs text-muted-foreground">Formation: Gestion financière pour PME</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Délivré à</span>
              <span className="font-medium">PME Ivoirienne</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">15 déc 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Note finale</span>
              <span className="font-medium">92/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Validité</span>
              <span className="font-medium">Permanente</span>
            </div>
          </div>
          <div className="pt-2">
            <Button size="sm" className="w-full">Télécharger le certificat</Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};
