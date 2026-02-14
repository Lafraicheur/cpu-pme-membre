import type { Meta, StoryObj } from '@storybook/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Afficher l'alerte</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action ne peut pas être annulée. Veuillez confirmer pour continuer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction>Continuer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const DeleteProduct: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Supprimer le produit</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le produit?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le produit "Café Arabica premium" sera définitivement
            supprimé du marketplace. Les commandes en cours ne seront pas affectées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const CancelOrder: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Annuler la commande</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Annuler cette commande?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point d'annuler la commande #CMD-2024-1234 d'un montant de 230,000 XOF.
            Le vendeur sera automatiquement notifié de l'annulation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Non, conserver</AlertDialogCancel>
          <AlertDialogAction>Oui, annuler la commande</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const RejectKYC: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Rejeter la demande</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rejeter la vérification KYC?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point de rejeter la demande de vérification KYC de l'entreprise
            "PME Ivoirienne SARL". L'utilisateur devra soumettre de nouveaux documents pour
            renouveler sa demande.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Rejeter la demande
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const DeleteAccount: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Supprimer mon compte</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer définitivement votre compte?</AlertDialogTitle>
          <AlertDialogDescription>
            Attention! Cette action est irréversible et entraînera:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>La suppression de tous vos produits sur le marketplace</li>
              <li>La perte de l'accès à vos formations en cours</li>
              <li>La suppression de votre historique de transactions</li>
              <li>La perte de tous vos certificats</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Non, conserver mon compte</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Oui, supprimer mon compte
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const LogoutConfirm: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Se déconnecter</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Se déconnecter?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point de vous déconnecter de votre compte CPU-PME. Assurez-vous
            d'avoir enregistré toutes vos modifications en cours.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Rester connecté</AlertDialogCancel>
          <AlertDialogAction>Se déconnecter</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const LeaveFormation: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Quitter la formation</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quitter cette formation?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes à 65% de progression dans la formation "Gestion financière pour PME".
            Si vous quittez maintenant, vous perdrez votre progression et devrez recommencer
            depuis le début si vous souhaitez vous réinscrire.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continuer la formation</AlertDialogCancel>
          <AlertDialogAction>Quitter</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const PublishProduct: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Publier sur le marketplace</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publier votre produit?</AlertDialogTitle>
          <AlertDialogDescription>
            Votre produit "Café Arabica premium" sera visible par tous les membres de la
            plateforme CPU-PME. Assurez-vous que toutes les informations sont correctes
            avant de publier.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Modifier</AlertDialogCancel>
          <AlertDialogAction>Publier maintenant</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const ArchiveTransaction: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary">Archiver</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archiver cette transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            La transaction sera déplacée dans vos archives et ne sera plus visible dans
            votre historique principal. Vous pourrez toujours y accéder depuis la section
            des archives.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction>Archiver</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
