import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Compte</TabsTrigger>
        <TabsTrigger value="password">Mot de passe</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm text-muted-foreground">
          Gérez les paramètres de votre compte ici.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm text-muted-foreground">
          Modifiez votre mot de passe ici.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const DashboardOverview: Story = {
  render: () => (
    <Tabs defaultValue="stats" className="w-[600px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="stats">Statistiques</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="activity">Activité</TabsTrigger>
      </TabsList>
      <TabsContent value="stats">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques du mois</CardTitle>
            <CardDescription>
              Vue d'ensemble de vos performances en décembre 2024
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Revenus totaux</span>
              <span className="font-semibold">2,450,000 XOF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Nombre de ventes</span>
              <span className="font-semibold">156</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="transactions">
        <Card>
          <CardHeader>
            <CardTitle>Transactions récentes</CardTitle>
            <CardDescription>
              Vos 5 dernières transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Liste des transactions...</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="activity">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Actions effectuées sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Historique d'activité...</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const MarketplaceSections: Story = {
  render: () => (
    <Tabs defaultValue="products" className="w-[700px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="products">Produits</TabsTrigger>
        <TabsTrigger value="sellers">Vendeurs</TabsTrigger>
        <TabsTrigger value="orders">Commandes</TabsTrigger>
        <TabsTrigger value="categories">Catégories</TabsTrigger>
      </TabsList>
      <TabsContent value="products">
        <Card>
          <CardHeader>
            <CardTitle>Produits</CardTitle>
            <CardDescription>
              Gérez le catalogue de produits de la marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              245 produits actifs sur la marketplace
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="sellers">
        <Card>
          <CardHeader>
            <CardTitle>Vendeurs</CardTitle>
            <CardDescription>
              PME ivoiriennes inscrites sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              87 vendeurs vérifiés
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="orders">
        <Card>
          <CardHeader>
            <CardTitle>Commandes</CardTitle>
            <CardDescription>
              Suivi des commandes et livraisons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              42 commandes en cours
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="categories">
        <Card>
          <CardHeader>
            <CardTitle>Catégories</CardTitle>
            <CardDescription>
              Organisation des produits par catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              12 catégories principales
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const KYCVerification: Story = {
  render: () => (
    <Tabs defaultValue="pending" className="w-[600px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">En attente</TabsTrigger>
        <TabsTrigger value="approved">Approuvées</TabsTrigger>
        <TabsTrigger value="rejected">Rejetées</TabsTrigger>
      </TabsList>
      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle>Demandes en attente</CardTitle>
            <CardDescription>
              Documents à vérifier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              28 demandes en attente de vérification
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="approved">
        <Card>
          <CardHeader>
            <CardTitle>Demandes approuvées</CardTitle>
            <CardDescription>
              Vérifications validées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              342 demandes approuvées ce mois
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="rejected">
        <Card>
          <CardHeader>
            <CardTitle>Demandes rejetées</CardTitle>
            <CardDescription>
              Documents non conformes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              15 demandes rejetées nécessitant une nouvelle soumission
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const FormationsCatalog: Story = {
  render: () => (
    <Tabs defaultValue="all" className="w-[700px]">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="all">Toutes</TabsTrigger>
        <TabsTrigger value="management">Gestion</TabsTrigger>
        <TabsTrigger value="marketing">Marketing</TabsTrigger>
        <TabsTrigger value="finance">Finance</TabsTrigger>
        <TabsTrigger value="hr">RH</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>Toutes les formations</CardTitle>
            <CardDescription>
              Catalogue complet des formations disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              127 formations pour les PME ivoiriennes
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="management">
        <Card>
          <CardHeader>
            <CardTitle>Gestion d'entreprise</CardTitle>
            <CardDescription>
              Formations en management et stratégie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              32 formations disponibles
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="marketing">
        <Card>
          <CardHeader>
            <CardTitle>Marketing digital</CardTitle>
            <CardDescription>
              Techniques de marketing et communication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              28 formations disponibles
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="finance">
        <Card>
          <CardHeader>
            <CardTitle>Finance et comptabilité</CardTitle>
            <CardDescription>
              Gestion financière pour PME
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              24 formations disponibles
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="hr">
        <Card>
          <CardHeader>
            <CardTitle>Ressources humaines</CardTitle>
            <CardDescription>
              Management d'équipe et RH
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              18 formations disponibles
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Tabs defaultValue="profile" className="w-[500px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="settings">Paramètres</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Modifiez les informations de votre profil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'entreprise</Label>
              <Input id="name" defaultValue="PME Ivoirienne" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="contact@pme-ci.com" />
            </div>
            <Button>Enregistrer les modifications</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
            <CardDescription>
              Configurez vos préférences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <Input id="language" defaultValue="Français" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Input id="currency" defaultValue="XOF (Franc CFA)" />
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const MembershipLevels: Story = {
  render: () => (
    <Tabs defaultValue="basic" className="w-[600px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Basique</TabsTrigger>
        <TabsTrigger value="premium">Premium</TabsTrigger>
        <TabsTrigger value="enterprise">Entreprise</TabsTrigger>
      </TabsList>
      <TabsContent value="basic">
        <Card>
          <CardHeader>
            <CardTitle>Membership Basique</CardTitle>
            <CardDescription>
              Fonctionnalités essentielles pour démarrer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">15,000 XOF/mois</p>
            <ul className="space-y-2 text-sm">
              <li>Accès au marketplace</li>
              <li>5 formations gratuites</li>
              <li>Support email</li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="premium">
        <Card>
          <CardHeader>
            <CardTitle>Membership Premium</CardTitle>
            <CardDescription>
              Pour les PME en croissance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">35,000 XOF/mois</p>
            <ul className="space-y-2 text-sm">
              <li>Toutes les fonctionnalités Basique</li>
              <li>Formations illimitées</li>
              <li>Support prioritaire</li>
              <li>Outils analytics avancés</li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="enterprise">
        <Card>
          <CardHeader>
            <CardTitle>Membership Entreprise</CardTitle>
            <CardDescription>
              Solutions personnalisées pour grandes entreprises
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">Sur devis</p>
            <ul className="space-y-2 text-sm">
              <li>Toutes les fonctionnalités Premium</li>
              <li>Compte manager dédié</li>
              <li>API personnalisée</li>
              <li>Formation sur site</li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const VerticalTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[600px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="details">Détails</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Tableau de bord</h3>
          <p className="text-sm text-muted-foreground">
            Bienvenue sur votre tableau de bord CPU-PME
          </p>
        </div>
      </TabsContent>
      <TabsContent value="details" className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Informations détaillées</h3>
          <p className="text-sm text-muted-foreground">
            Consultez les informations complètes de votre compte
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
