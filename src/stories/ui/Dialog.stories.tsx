import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Ouvrir le dialogue</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Titre du dialogue</DialogTitle>
          <DialogDescription>
            Ceci est la description du dialogue. Elle explique le contenu ou l'action à effectuer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">Contenu du dialogue ici...</p>
        </div>
      </DialogContent>
    </Dialog>
  ),
};

export const AddProduct: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Ajouter un produit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau produit</DialogTitle>
          <DialogDescription>
            Remplissez les informations du produit à ajouter sur le marketplace.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom du produit</Label>
            <Input id="name" placeholder="Ex: Café Arabica premium" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Prix (XOF)</Label>
            <Input id="price" type="number" placeholder="15000" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Décrivez votre produit..." />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Ajouter le produit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const KYCDocumentUpload: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Télécharger un document</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Vérification KYC</DialogTitle>
          <DialogDescription>
            Téléchargez votre pièce d'identité pour compléter votre vérification KYC.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="document-type">Type de document</Label>
            <Input id="document-type" placeholder="Carte d'identité nationale" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file">Fichier</Label>
            <Input id="file" type="file" accept="image/*,.pdf" />
          </div>
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Formats acceptés: JPG, PNG, PDF (max 5MB)
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Annuler</Button>
          <Button>Télécharger</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const EditProfile: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Modifier le profil</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Modifier le profil de l'entreprise</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de votre entreprise sur CPU-PME.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="company-name">Nom de l'entreprise</Label>
            <Input id="company-name" defaultValue="PME Ivoirienne SARL" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sector">Secteur d'activité</Label>
              <Input id="sector" defaultValue="Agriculture" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employees">Nombre d'employés</Label>
              <Input id="employees" type="number" defaultValue="25" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" defaultValue="Cocody, Abidjan" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Description</Label>
            <Textarea
              id="bio"
              defaultValue="Spécialiste en production et transformation de produits agricoles locaux."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Annuler</Button>
          <Button>Enregistrer les modifications</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const EnrollFormation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>S'inscrire à la formation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Inscription à la formation</DialogTitle>
          <DialogDescription>
            Confirmez votre inscription à "Gestion financière pour PME".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4 space-y-2">
            <h4 className="font-semibold">Détails de la formation</h4>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Durée:</span> 6 semaines</p>
              <p><span className="text-muted-foreground">Début:</span> 15 janvier 2025</p>
              <p><span className="text-muted-foreground">Format:</span> En ligne</p>
              <p><span className="text-muted-foreground">Prix:</span> 45,000 XOF</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="motivation">Motivation (optionnel)</Label>
            <Textarea
              id="motivation"
              placeholder="Pourquoi souhaitez-vous suivre cette formation?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Annuler</Button>
          <Button>Confirmer l'inscription</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const OrderDetails: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Voir la commande</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Détails de la commande #CMD-2024-1234</DialogTitle>
          <DialogDescription>
            Commande passée le 15 décembre 2024
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <h4 className="font-semibold">Articles commandés</h4>
            <div className="border rounded-lg divide-y">
              <div className="p-3 flex justify-between">
                <div>
                  <p className="font-medium">Café Arabica premium</p>
                  <p className="text-sm text-muted-foreground">Quantité: 10kg</p>
                </div>
                <p className="font-semibold">150,000 XOF</p>
              </div>
              <div className="p-3 flex justify-between">
                <div>
                  <p className="font-medium">Cacao bio</p>
                  <p className="text-sm text-muted-foreground">Quantité: 5kg</p>
                </div>
                <p className="font-semibold">75,000 XOF</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span>225,000 XOF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Livraison</span>
              <span>5,000 XOF</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span>230,000 XOF</span>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium">Statut: En cours de livraison</p>
            <p className="text-sm text-muted-foreground mt-1">
              Livraison prévue le 20 décembre 2024
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Suivre la livraison</Button>
          <Button>Contacter le vendeur</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ShareProfile: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Partager</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager le profil</DialogTitle>
          <DialogDescription>
            Partagez le profil de votre entreprise avec d'autres membres.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Lien
            </Label>
            <Input
              id="link"
              defaultValue="https://cpu-pme.ci/entreprise/pme-ivoirienne"
              readOnly
            />
          </div>
          <Button type="submit" size="sm" className="px-3">
            Copier
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithScroll: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Conditions d'utilisation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Conditions générales d'utilisation</DialogTitle>
          <DialogDescription>
            Veuillez lire attentivement avant de continuer.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto py-4 pr-4">
          <div className="space-y-4 text-sm">
            <p>
              En utilisant la plateforme CPU-PME, vous acceptez les présentes conditions
              d'utilisation.
            </p>
            <h4 className="font-semibold">1. Inscription et compte</h4>
            <p>
              Pour accéder aux services de la plateforme, vous devez créer un compte et
              fournir des informations exactes et à jour.
            </p>
            <h4 className="font-semibold">2. Utilisation de la plateforme</h4>
            <p>
              Vous vous engagez à utiliser la plateforme de manière légale et conforme aux
              lois en vigueur en Côte d'Ivoire.
            </p>
            <h4 className="font-semibold">3. Marketplace</h4>
            <p>
              Les transactions sur le marketplace se font directement entre vendeurs et
              acheteurs. CPU-PME facilite la mise en relation mais n'est pas partie aux
              transactions.
            </p>
            <h4 className="font-semibold">4. Formations</h4>
            <p>
              L'accès aux formations est soumis au paiement des frais correspondants. Les
              certificats sont délivrés après validation des acquis.
            </p>
            <h4 className="font-semibold">5. Vérification KYC</h4>
            <p>
              La vérification KYC est obligatoire pour accéder à certains services. Les
              documents fournis doivent être authentiques.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Refuser</Button>
          <Button>Accepter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
