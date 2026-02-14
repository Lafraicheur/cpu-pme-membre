import type { Meta, StoryObj } from '@storybook/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Settings, User, LogOut, Package, FileText, Download } from 'lucide-react';

const meta = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profil</DropdownMenuItem>
        <DropdownMenuItem>Paramètres</DropdownMenuItem>
        <DropdownMenuItem>Facturation</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Se déconnecter</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const ProductActions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions du produit</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Package className="mr-2 h-4 w-4" />
          Voir les détails
        </DropdownMenuItem>
        <DropdownMenuItem>Modifier</DropdownMenuItem>
        <DropdownMenuItem>Dupliquer</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Statut</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Publié</DropdownMenuItem>
            <DropdownMenuItem>Brouillon</DropdownMenuItem>
            <DropdownMenuItem>Archivé</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithShortcuts: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions rapides</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Raccourcis</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Nouveau produit
          <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Ouvrir commandes
          <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Rechercher
          <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Enregistrer
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckboxes: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Affichage</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Colonnes visibles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Nom</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked>Prix</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Stock</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked>Catégorie</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Date de création</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithRadioGroup: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Trier par</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Options de tri</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="date">
          <DropdownMenuRadioItem value="date">Date (récent)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="date-asc">Date (ancien)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name">Nom (A-Z)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price">Prix (croissant)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price-desc">Prix (décroissant)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const KYCActions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions KYC</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Vérification KYC</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <FileText className="mr-2 h-4 w-4" />
          Voir les documents
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="mr-2 h-4 w-4" />
          Télécharger le dossier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-green-600">Approuver la demande</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">Rejeter la demande</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const FormationOptions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Gestion de la formation</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Voir le contenu</DropdownMenuItem>
        <DropdownMenuItem>Télécharger les ressources</DropdownMenuItem>
        <DropdownMenuItem>Voir ma progression</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Certificat</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Télécharger PDF</DropdownMenuItem>
            <DropdownMenuItem>Partager sur LinkedIn</DropdownMenuItem>
            <DropdownMenuItem>Vérifier l'authenticité</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">Quitter la formation</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
