import type { Meta, StoryObj } from '@storybook/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuCheckboxItem,
} from '@/components/ui/context-menu';

const meta = {
  title: 'UI/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Clic droit ici
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>Retour</ContextMenuItem>
        <ContextMenuItem>Avancer</ContextMenuItem>
        <ContextMenuItem>Actualiser</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Plus d'outils</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[200px] w-[300px] flex-col items-center justify-center rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold">Café Arabica Premium</h3>
        <p className="text-sm text-muted-foreground mt-2">15,000 XOF/kg</p>
        <p className="text-xs text-muted-foreground mt-4">Clic droit pour les options</p>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>Voir les détails</ContextMenuItem>
        <ContextMenuItem>Ajouter au panier</ContextMenuItem>
        <ContextMenuItem>Ajouter aux favoris</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Partager</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>WhatsApp</ContextMenuItem>
            <ContextMenuItem>Facebook</ContextMenuItem>
            <ContextMenuItem>Twitter</ContextMenuItem>
            <ContextMenuItem>Copier le lien</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>Signaler</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const FormationCard: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[200px] w-[350px] flex-col rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold">Gestion financière pour PME</h3>
        <p className="text-sm text-muted-foreground mt-2">Formation certifiante - 6 semaines</p>
        <p className="text-sm font-semibold mt-4">45,000 XOF</p>
        <p className="text-xs text-muted-foreground mt-4">Clic droit pour plus d'options</p>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>Voir le programme</ContextMenuItem>
        <ContextMenuItem>S'inscrire</ContextMenuItem>
        <ContextMenuItem>Ajouter à ma liste</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Informations</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Formateur</ContextMenuItem>
            <ContextMenuItem>Durée et horaires</ContextMenuItem>
            <ContextMenuItem>Prérequis</ContextMenuItem>
            <ContextMenuItem>Certificat</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>Partager</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const TableRow: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[80px] w-[600px] items-center rounded-lg border px-6">
        <div className="flex-1">
          <p className="font-medium">Commande #CMD-2024-1234</p>
          <p className="text-sm text-muted-foreground">230,000 XOF • En cours</p>
        </div>
        <p className="text-xs text-muted-foreground">Clic droit pour les actions</p>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>Voir les détails</ContextMenuItem>
        <ContextMenuItem>Suivre la livraison</ContextMenuItem>
        <ContextMenuItem>Contacter le vendeur</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Exporter</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>PDF</ContextMenuItem>
            <ContextMenuItem>Excel</ContextMenuItem>
            <ContextMenuItem>CSV</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>Dupliquer la commande</ContextMenuItem>
        <ContextMenuItem className="text-destructive">Annuler la commande</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const DocumentKYC: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[180px] w-[350px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
        <p className="font-medium">Document d'identité</p>
        <p className="text-sm text-muted-foreground mt-2">CNI_123456789.pdf</p>
        <p className="text-xs text-muted-foreground mt-4">Clic droit pour gérer</p>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>Ouvrir</ContextMenuItem>
        <ContextMenuItem>Télécharger</ContextMenuItem>
        <ContextMenuItem>Prévisualiser</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Statut</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>En attente</ContextMenuItem>
            <ContextMenuItem>En révision</ContextMenuItem>
            <ContextMenuItem>Approuvé</ContextMenuItem>
            <ContextMenuItem>Rejeté</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>Remplacer</ContextMenuItem>
        <ContextMenuItem className="text-destructive">Supprimer</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const MemberProfile: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center gap-4 rounded-lg border p-4">
        <div className="h-16 w-16 rounded-full bg-muted" />
        <div className="flex-1">
          <p className="font-semibold">PME Ivoirienne SARL</p>
          <p className="text-sm text-muted-foreground">Membre Premium</p>
          <p className="text-xs text-muted-foreground mt-2">Clic droit pour actions</p>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>Voir le profil</ContextMenuItem>
        <ContextMenuItem>Envoyer un message</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Voir les produits</ContextMenuItem>
        <ContextMenuItem>Historique des transactions</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>Suivre</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>Bloquer</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Signaler</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithCheckboxes: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed">
        Options d'affichage<br />
        <span className="text-xs text-muted-foreground">Clic droit</span>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>Paramètres d'affichage</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>Afficher les prix</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked>Afficher les images</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>Afficher les statistiques</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>Mode compact</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Réinitialiser les préférences</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
