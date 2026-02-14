import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

const meta = {
  title: 'UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Ouvrir</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Dimensions</h4>
          <p className="text-sm text-muted-foreground">
            Définissez les dimensions de l'élément.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Paramètres</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Paramètres du produit</h4>
            <p className="text-sm text-muted-foreground">
              Modifiez les informations rapidement.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Largeur</Label>
              <Input id="width" defaultValue="100" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max</Label>
              <Input id="maxWidth" defaultValue="300" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Hauteur</Label>
              <Input id="height" defaultValue="25" className="col-span-2 h-8" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const FilterProducts: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Filtrer les produits</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Filtres</h4>
            <p className="text-sm text-muted-foreground">
              Affinez votre recherche sur le marketplace
            </p>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="min-price">Prix minimum (XOF)</Label>
              <Input id="min-price" type="number" placeholder="5000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-price">Prix maximum (XOF)</Label>
              <Input id="max-price" type="number" placeholder="50000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input id="category" placeholder="Agriculture, Textile..." />
            </div>
            <Button size="sm">Appliquer les filtres</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const QuickActions: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Actions rapides</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-2">
          <h4 className="font-medium leading-none mb-2">Actions</h4>
          <Button variant="outline" size="sm" className="justify-start">
            Ajouter un produit
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            Voir les commandes
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            Gérer l'inventaire
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            Statistiques
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const NotificationSettings: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Notifications</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Préférences de notification</h4>
            <p className="text-sm text-muted-foreground">
              Choisissez quand recevoir des notifications
            </p>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="orders" className="cursor-pointer">Nouvelles commandes</Label>
              <input type="checkbox" id="orders" defaultChecked className="cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="kyc" className="cursor-pointer">Mises à jour KYC</Label>
              <input type="checkbox" id="kyc" defaultChecked className="cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="formations" className="cursor-pointer">Nouvelles formations</Label>
              <input type="checkbox" id="formations" className="cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="promo" className="cursor-pointer">Promotions</Label>
              <input type="checkbox" id="promo" className="cursor-pointer" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const ShareOptions: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Partager</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Partager ce produit</h4>
            <p className="text-sm text-muted-foreground">
              Partagez sur vos réseaux sociaux
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Facebook
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Twitter
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              LinkedIn
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input value="https://cpu-pme.ci/produit/123" readOnly />
            <Button size="sm">Copier</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const FormationInfo: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link">En savoir plus</Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Gestion financière pour PME</h4>
            <p className="text-sm text-muted-foreground">
              Formation complète pour maîtriser la gestion financière de votre entreprise
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durée:</span>
              <span className="font-medium">6 semaines</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Niveau:</span>
              <span className="font-medium">Intermédiaire</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prix:</span>
              <span className="font-medium">45,000 XOF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inscrits:</span>
              <span className="font-medium">245 participants</span>
            </div>
          </div>
          <Button size="sm">S'inscrire maintenant</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          @pme_ivoirienne
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">PME Ivoirienne SARL</h4>
            <p className="text-sm text-muted-foreground">
              Spécialiste en produits agricoles locaux
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold">156</div>
              <div className="text-muted-foreground">Produits</div>
            </div>
            <div>
              <div className="font-semibold">2.4k</div>
              <div className="text-muted-foreground">Ventes</div>
            </div>
            <div>
              <div className="font-semibold">4.8</div>
              <div className="text-muted-foreground">Note</div>
            </div>
          </div>
          <Button size="sm">Voir le profil</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
