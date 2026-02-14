import type { Meta, StoryObj } from '@storybook/react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Ouvrir</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Panneau latéral</SheetTitle>
          <SheetDescription>
            Effectuez vos modifications ici. Cliquez sur enregistrer quand vous avez terminé.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const RightSide: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Filtre des produits</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Filtrer les produits</SheetTitle>
          <SheetDescription>
            Affinez votre recherche sur le marketplace
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Catégorie</Label>
            <Input id="category" placeholder="Agriculture, Textile..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="min-price">Prix minimum (XOF)</Label>
            <Input id="min-price" type="number" placeholder="5000" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="max-price">Prix maximum (XOF)</Label>
            <Input id="max-price" type="number" placeholder="50000" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Appliquer les filtres</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const LeftSide: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Menu</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Menu principal de CPU-PME
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Button variant="ghost" className="justify-start">Tableau de bord</Button>
          <Button variant="ghost" className="justify-start">Marketplace</Button>
          <Button variant="ghost" className="justify-start">Formations</Button>
          <Button variant="ghost" className="justify-start">Vérification KYC</Button>
          <Button variant="ghost" className="justify-start">Paramètres</Button>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const CartSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Panier (3)</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Votre panier</SheetTitle>
          <SheetDescription>
            3 articles dans votre panier
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="border rounded-lg p-3">
            <h4 className="font-medium">Café Arabica premium</h4>
            <p className="text-sm text-muted-foreground">10kg × 15,000 XOF</p>
            <p className="font-semibold mt-1">150,000 XOF</p>
          </div>
          <div className="border rounded-lg p-3">
            <h4 className="font-medium">Cacao bio</h4>
            <p className="text-sm text-muted-foreground">5kg × 15,000 XOF</p>
            <p className="font-semibold mt-1">75,000 XOF</p>
          </div>
          <div className="border rounded-lg p-3">
            <h4 className="font-medium">Huile de palme</h4>
            <p className="text-sm text-muted-foreground">2L × 5,000 XOF</p>
            <p className="font-semibold mt-1">10,000 XOF</p>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>235,000 XOF</span>
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button className="w-full">Commander</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const NotificationsSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Notifications (5)</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Vous avez 5 nouvelles notifications
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 py-4">
          <div className="border-l-4 border-primary pl-3 py-2">
            <h5 className="font-medium text-sm">Nouvelle commande</h5>
            <p className="text-xs text-muted-foreground">Commande #CMD-2024-1234 reçue</p>
            <p className="text-xs text-muted-foreground mt-1">Il y a 5 minutes</p>
          </div>
          <div className="border-l-4 border-green-500 pl-3 py-2">
            <h5 className="font-medium text-sm">KYC approuvée</h5>
            <p className="text-xs text-muted-foreground">Votre vérification KYC a été approuvée</p>
            <p className="text-xs text-muted-foreground mt-1">Il y a 1 heure</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-3 py-2">
            <h5 className="font-medium text-sm">Nouvelle formation disponible</h5>
            <p className="text-xs text-muted-foreground">Marketing digital pour PME</p>
            <p className="text-xs text-muted-foreground mt-1">Il y a 2 heures</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const ProductDetails: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Voir les détails</Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Café Arabica Premium</SheetTitle>
          <SheetDescription>
            Produit par PME Ivoirienne SARL
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Image du produit</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Description</h4>
            <p className="text-sm text-muted-foreground">
              Café Arabica cultivé dans les montagnes de l'ouest ivoirien. Torréfaction
              artisanale pour préserver tous les arômes.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Prix</p>
              <p className="font-semibold">15,000 XOF/kg</p>
            </div>
            <div>
              <p className="text-muted-foreground">Stock</p>
              <p className="font-semibold">45 kg disponibles</p>
            </div>
            <div>
              <p className="text-muted-foreground">Catégorie</p>
              <p className="font-semibold">Agriculture</p>
            </div>
            <div>
              <p className="text-muted-foreground">Origine</p>
              <p className="font-semibold">Man, CI</p>
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button className="w-full">Ajouter au panier</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
