import type { Meta, StoryObj } from '@storybook/react';
import { SidebarProvider } from '@/components/ui/sidebar';

const meta = {
  title: 'UI/Sidebar',
  component: SidebarProvider,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SidebarProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicUsage: Story = {
  render: () => (
    <div className="p-4">
      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">Sidebar Component</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Le composant Sidebar est un composant complexe qui fournit une barre latérale
          réactive avec support mobile, états collapsed/expanded, et raccourcis clavier.
        </p>
        <p className="text-sm text-muted-foreground">
          Ce composant doit être utilisé avec SidebarProvider, Sidebar, SidebarContent,
          SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, et autres
          sous-composants pour créer une navigation latérale complète.
        </p>
      </div>
    </div>
  ),
};

export const Description: Story = {
  render: () => (
    <div className="max-w-3xl p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Sidebar</h2>
        <p className="text-muted-foreground">
          Composant de navigation latérale pour les tableaux de bord et applications
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Caractéristiques</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>États collapsible et expandable</li>
            <li>Adaptation automatique mobile/desktop</li>
            <li>Raccourci clavier (Cmd/Ctrl+B)</li>
            <li>Gestion d'état via contexte React</li>
            <li>Sauvegarde de l'état dans les cookies</li>
            <li>Support des tooltips en mode collapsed</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Utilisation dans CPU-PME</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Navigation principale du dashboard</li>
            <li>Menu des sections (Marketplace, Formations, KYC)</li>
            <li>Accès rapide aux fonctionnalités</li>
            <li>Menu de gestion pour administrateurs</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Composants associés</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="border rounded p-2">
              <code className="text-xs">SidebarProvider</code>
              <p className="text-xs text-muted-foreground mt-1">Fournisseur de contexte</p>
            </div>
            <div className="border rounded p-2">
              <code className="text-xs">Sidebar</code>
              <p className="text-xs text-muted-foreground mt-1">Conteneur principal</p>
            </div>
            <div className="border rounded p-2">
              <code className="text-xs">SidebarContent</code>
              <p className="text-xs text-muted-foreground mt-1">Zone de contenu</p>
            </div>
            <div className="border rounded p-2">
              <code className="text-xs">SidebarGroup</code>
              <p className="text-xs text-muted-foreground mt-1">Groupe de navigation</p>
            </div>
            <div className="border rounded p-2">
              <code className="text-xs">SidebarMenu</code>
              <p className="text-xs text-muted-foreground mt-1">Menu de navigation</p>
            </div>
            <div className="border rounded p-2">
              <code className="text-xs">SidebarMenuItem</code>
              <p className="text-xs text-muted-foreground mt-1">Item de menu</p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">Exemple de structure</h4>
          <pre className="text-xs overflow-x-auto">
{`<SidebarProvider>
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                Tableau de bord
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</SidebarProvider>`}
          </pre>
        </div>
      </div>
    </div>
  ),
};

export const Features: Story = {
  render: () => (
    <div className="max-w-4xl p-6 space-y-6">
      <h2 className="text-2xl font-bold">Fonctionnalités du Sidebar</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Mode Desktop</h3>
          <p className="text-sm text-muted-foreground">
            Sidebar toujours visible avec possibilité de réduire/agrandir.
            Largeur par défaut: 16rem, réduit: 3rem
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Mode Mobile</h3>
          <p className="text-sm text-muted-foreground">
            Sheet modal qui s'ouvre par-dessus le contenu.
            Largeur mobile: 18rem
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Raccourci clavier</h3>
          <p className="text-sm text-muted-foreground">
            Appuyez sur Cmd+B (Mac) ou Ctrl+B (Windows/Linux) pour
            basculer l'état du sidebar
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Persistance</h3>
          <p className="text-sm text-muted-foreground">
            L'état du sidebar est sauvegardé dans un cookie
            (sidebar:state) pour 7 jours
          </p>
        </div>
      </div>
    </div>
  ),
};

export const UseCases: Story = {
  render: () => (
    <div className="max-w-4xl p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Cas d'usage - Plateforme CPU-PME</h2>

      <div className="space-y-4">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="font-semibold mb-2">Dashboard Principal</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Navigation entre les différentes sections de la plateforme
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Vue d'ensemble / Statistiques</li>
            <li>• Marketplace (Produits, Vendeurs, Commandes)</li>
            <li>• Formations (Catalogue, Mes formations, Certificats)</li>
            <li>• KYC (Vérification, Documents, Statut)</li>
            <li>• Profil et Paramètres</li>
          </ul>
        </div>

        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="font-semibold mb-2">Interface Vendeur</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Gestion des produits et ventes sur le marketplace
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Mes produits</li>
            <li>• Ajouter un produit</li>
            <li>• Commandes reçues</li>
            <li>• Statistiques de vente</li>
            <li>• Évaluations clients</li>
          </ul>
        </div>

        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="font-semibold mb-2">Panneau Administrateur</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Gestion complète de la plateforme
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Gestion des membres</li>
            <li>• Modération marketplace</li>
            <li>• Validation KYC</li>
            <li>• Gestion des formations</li>
            <li>• Analytics et rapports</li>
            <li>• Configuration système</li>
          </ul>
        </div>

        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="font-semibold mb-2">Espace Formation</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Navigation dans le parcours de formation
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Catalogue de formations</li>
            <li>• Mes formations en cours</li>
            <li>• Formations terminées</li>
            <li>• Certificats obtenus</li>
            <li>• Progression globale</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};
