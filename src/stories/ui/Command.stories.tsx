import type { Meta, StoryObj } from '@storybook/react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Search, Package, GraduationCap, FileCheck, Settings } from 'lucide-react';

const meta = {
  title: 'UI/Command',
  component: Command,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Rechercher..." />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Tableau de bord</CommandItem>
          <CommandItem>Marketplace</CommandItem>
          <CommandItem>Formations</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Rechercher des fonctionnalités..." />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem>
            <Package className="mr-2 h-4 w-4" />
            <span>Marketplace</span>
          </CommandItem>
          <CommandItem>
            <GraduationCap className="mr-2 h-4 w-4" />
            <span>Formations</span>
          </CommandItem>
          <CommandItem>
            <FileCheck className="mr-2 h-4 w-4" />
            <span>Vérification KYC</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Paramètres">
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Préférences</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const ProductSearch: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[500px]">
      <CommandInput placeholder="Rechercher un produit..." />
      <CommandList>
        <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
        <CommandGroup heading="Produits populaires">
          <CommandItem>
            <Package className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">Café Arabica Premium</p>
              <p className="text-xs text-muted-foreground">15,000 XOF/kg</p>
            </div>
          </CommandItem>
          <CommandItem>
            <Package className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">Cacao bio</p>
              <p className="text-xs text-muted-foreground">15,000 XOF/kg</p>
            </div>
          </CommandItem>
          <CommandItem>
            <Package className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">Huile de palme</p>
              <p className="text-xs text-muted-foreground">5,000 XOF/L</p>
            </div>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Catégories">
          <CommandItem>Agriculture</CommandItem>
          <CommandItem>Textile</CommandItem>
          <CommandItem>Artisanat</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const FormationSearch: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[500px]">
      <CommandInput placeholder="Rechercher une formation..." />
      <CommandList>
        <CommandEmpty>Aucune formation trouvée.</CommandEmpty>
        <CommandGroup heading="Formations recommandées">
          <CommandItem>
            <GraduationCap className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">Gestion financière pour PME</p>
              <p className="text-xs text-muted-foreground">6 semaines • 45,000 XOF</p>
            </div>
          </CommandItem>
          <CommandItem>
            <GraduationCap className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">Marketing digital</p>
              <p className="text-xs text-muted-foreground">4 semaines • 35,000 XOF</p>
            </div>
          </CommandItem>
          <CommandItem>
            <GraduationCap className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">Gestion des ressources humaines</p>
              <p className="text-xs text-muted-foreground">5 semaines • 40,000 XOF</p>
            </div>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const MultipleGroups: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[500px]">
      <CommandInput placeholder="Rechercher sur CPU-PME..." />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        <CommandGroup heading="Produits">
          <CommandItem>Café Arabica Premium</CommandItem>
          <CommandItem>Cacao bio</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Formations">
          <CommandItem>Gestion financière pour PME</CommandItem>
          <CommandItem>Marketing digital</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Vendeurs">
          <CommandItem>PME Ivoirienne SARL</CommandItem>
          <CommandItem>Agro Business CI</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const QuickActions: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Actions rapides..." />
      <CommandList>
        <CommandEmpty>Aucune action trouvée.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem>
            <span>Ajouter un produit</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘N</span>
          </CommandItem>
          <CommandItem>
            <span>Voir les commandes</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘O</span>
          </CommandItem>
          <CommandItem>
            <span>Créer une formation</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘F</span>
          </CommandItem>
          <CommandItem>
            <span>Paramètres</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘,</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
