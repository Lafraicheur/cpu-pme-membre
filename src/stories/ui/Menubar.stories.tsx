import type { Meta, StoryObj } from '@storybook/react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from '@/components/ui/menubar';

const meta = {
  title: 'UI/Menubar',
  component: Menubar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Fichier</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Nouveau <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Ouvrir <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Enregistrer <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Édition</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Annuler <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Rétablir <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const DashboardMenu: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Tableau de bord</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Vue d'ensemble</MenubarItem>
          <MenubarItem>Statistiques</MenubarItem>
          <MenubarItem>Rapports</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Exporter les données</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Membres</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Liste des membres</MenubarItem>
          <MenubarItem>Ajouter un membre</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Exporter la liste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Marketplace</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Produits</MenubarItem>
          <MenubarItem>Vendeurs</MenubarItem>
          <MenubarItem>Commandes</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Catégories</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithCheckboxes: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Affichage</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>
            Barre latérale
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked>
            Notifications
          </MenubarCheckboxItem>
          <MenubarCheckboxItem>
            Mode sombre
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarCheckboxItem checked>
            Afficher les statistiques
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithRadioGroup: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Langue</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value="fr">
            <MenubarRadioItem value="fr">Français</MenubarRadioItem>
            <MenubarRadioItem value="en">English</MenubarRadioItem>
            <MenubarRadioItem value="ar">العربية</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Devise</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value="xof">
            <MenubarRadioItem value="xof">XOF (Franc CFA)</MenubarRadioItem>
            <MenubarRadioItem value="eur">EUR (Euro)</MenubarRadioItem>
            <MenubarRadioItem value="usd">USD (Dollar)</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithSubmenus: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Formations</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Toutes les formations</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Catégories</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Gestion d'entreprise</MenubarItem>
              <MenubarItem>Marketing digital</MenubarItem>
              <MenubarItem>Comptabilité</MenubarItem>
              <MenubarItem>Ressources humaines</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>Niveau</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Débutant</MenubarItem>
              <MenubarItem>Intermédiaire</MenubarItem>
              <MenubarItem>Avancé</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Mes formations</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const KYCMenu: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>KYC</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Demandes en attente</MenubarItem>
          <MenubarItem>Demandes approuvées</MenubarItem>
          <MenubarItem>Demandes rejetées</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Filtrer par type</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Documents d'identité</MenubarItem>
              <MenubarItem>Justificatifs d'adresse</MenubarItem>
              <MenubarItem>Documents professionnels</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Exporter le rapport</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Paramètres</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Critères de validation</MenubarItem>
          <MenubarItem>Notifications</MenubarItem>
          <MenubarItem>Historique</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const TransactionsMenu: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Transactions</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Toutes les transactions</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Filtrer par statut</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>En attente</MenubarItem>
              <MenubarItem>Validées</MenubarItem>
              <MenubarItem>Annulées</MenubarItem>
              <MenubarItem>Remboursées</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>Période</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Aujourd'hui</MenubarItem>
              <MenubarItem>Cette semaine</MenubarItem>
              <MenubarItem>Ce mois-ci</MenubarItem>
              <MenubarItem>Personnalisé</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Exporter en CSV</MenubarItem>
          <MenubarItem>Exporter en PDF</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const CompleteExample: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Plateforme</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Tableau de bord <MenubarShortcut>⌘D</MenubarShortcut></MenubarItem>
          <MenubarItem>Profil <MenubarShortcut>⌘P</MenubarShortcut></MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Paramètres <MenubarShortcut>⌘,</MenubarShortcut></MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Déconnexion</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Services</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Marketplace</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Produits</MenubarItem>
              <MenubarItem>Vendeurs</MenubarItem>
              <MenubarItem>Commandes</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>Formations</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Catalogue</MenubarItem>
              <MenubarItem>Mes formations</MenubarItem>
              <MenubarItem>Certificats</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem>Vérification KYC</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Aide</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Documentation</MenubarItem>
          <MenubarItem>Support</MenubarItem>
          <MenubarItem>FAQ</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>À propos de CPU-PME</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};
