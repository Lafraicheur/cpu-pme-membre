import type { Meta, StoryObj } from '@storybook/react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Ouvrir le drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Titre du drawer</DrawerTitle>
          <DrawerDescription>Description du contenu du drawer</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Contenu du drawer ici...
          </p>
        </div>
        <DrawerFooter>
          <Button>Valider</Button>
          <DrawerClose asChild>
            <Button variant="outline">Annuler</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const QuickOrder: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Commander rapidement</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Passer une commande</DrawerTitle>
          <DrawerDescription>
            Remplissez les informations pour commander ce produit
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantité</Label>
            <Input id="quantity" type="number" placeholder="10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="delivery">Adresse de livraison</Label>
            <Input id="delivery" placeholder="Cocody, Abidjan" />
          </div>
          <div className="rounded-lg bg-muted p-3">
            <div className="flex justify-between text-sm">
              <span>Total estimé</span>
              <span className="font-semibold">150,000 XOF</span>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button>Confirmer la commande</Button>
          <DrawerClose asChild>
            <Button variant="outline">Annuler</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const FormationEnrollment: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>S'inscrire</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Inscription à la formation</DrawerTitle>
          <DrawerDescription>
            Gestion financière pour PME - 45,000 XOF
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="rounded-lg border p-3">
            <h4 className="font-semibold mb-2">Détails de la formation</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Durée:</span> 6 semaines</p>
              <p><span className="text-muted-foreground">Début:</span> 15 janvier 2025</p>
              <p><span className="text-muted-foreground">Format:</span> En ligne</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" placeholder="Votre nom" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="votre@email.com" />
          </div>
        </div>
        <DrawerFooter>
          <Button>Confirmer l'inscription</Button>
          <DrawerClose asChild>
            <Button variant="outline">Annuler</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const ReviewProduct: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Laisser un avis</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Évaluer ce produit</DrawerTitle>
          <DrawerDescription>
            Partagez votre expérience avec Café Arabica Premium
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="grid gap-2">
            <Label>Note</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button key={star} variant="outline" size="icon">
                  {star}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Titre de l'avis</Label>
            <Input id="title" placeholder="Excellent produit!" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment">Commentaire</Label>
            <textarea
              id="comment"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Partagez votre expérience..."
            />
          </div>
        </div>
        <DrawerFooter>
          <Button>Publier l'avis</Button>
          <DrawerClose asChild>
            <Button variant="outline">Annuler</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const KYCDocumentSubmit: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Soumettre un document</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Vérification KYC</DrawerTitle>
          <DrawerDescription>
            Téléchargez votre document d'identité
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="doc-type">Type de document</Label>
            <Input id="doc-type" placeholder="Carte d'identité, Passeport..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="doc-number">Numéro du document</Label>
            <Input id="doc-number" placeholder="CI123456789" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file">Fichier (PDF, JPG, PNG)</Label>
            <Input id="file" type="file" accept=".pdf,.jpg,.jpeg,.png" />
          </div>
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Format accepté: PDF, JPG, PNG (Max 5MB)
          </div>
        </div>
        <DrawerFooter>
          <Button>Soumettre</Button>
          <DrawerClose asChild>
            <Button variant="outline">Annuler</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
