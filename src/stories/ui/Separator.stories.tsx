import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '@/components/ui/separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-[400px]">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          Une bibliothèque de composants open-source.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Documentation</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-[200px] items-center justify-center space-x-4">
      <div className="space-y-1 text-center">
        <h4 className="text-sm font-medium">Produits</h4>
        <p className="text-sm text-muted-foreground">156</p>
      </div>
      <Separator orientation="vertical" />
      <div className="space-y-1 text-center">
        <h4 className="text-sm font-medium">Ventes</h4>
        <p className="text-sm text-muted-foreground">2.4k</p>
      </div>
      <Separator orientation="vertical" />
      <div className="space-y-1 text-center">
        <h4 className="text-sm font-medium">Note</h4>
        <p className="text-sm text-muted-foreground">4.8/5</p>
      </div>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-[400px] space-y-4 rounded-lg border p-6">
      <div>
        <h3 className="text-lg font-semibold">PME Ivoirienne SARL</h3>
        <p className="text-sm text-muted-foreground">Membre Premium</p>
      </div>
      <Separator />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email:</span>
          <span>contact@pme-ci.com</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Téléphone:</span>
          <span>+225 07 00 00 00 00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Ville:</span>
          <span>Abidjan</span>
        </div>
      </div>
      <Separator />
      <div className="text-sm">
        <p className="text-muted-foreground">Membre depuis</p>
        <p className="font-medium">Janvier 2024</p>
      </div>
    </div>
  ),
};

export const SectionDivider: Story = {
  render: () => (
    <div className="w-[600px] space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Détails de la commande</h2>
        <p className="text-muted-foreground">Commande #CMD-2024-1234</p>
      </div>
      <Separator />
      <div>
        <h3 className="text-lg font-semibold mb-3">Articles</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Café Arabica premium - 10kg</span>
            <span>150,000 XOF</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Cacao bio - 5kg</span>
            <span>75,000 XOF</span>
          </div>
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="text-lg font-semibold mb-3">Livraison</h3>
        <p className="text-sm text-muted-foreground">
          Adresse: Cocody, Abidjan<br />
          Estimation: 2-3 jours ouvrables
        </p>
      </div>
      <Separator />
      <div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>230,000 XOF</span>
        </div>
      </div>
    </div>
  ),
};

export const MenuDivider: Story = {
  render: () => (
    <div className="w-[300px] rounded-lg border p-4">
      <div className="space-y-1">
        <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent">
          Mon profil
        </button>
        <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent">
          Paramètres
        </button>
      </div>
      <Separator className="my-2" />
      <div className="space-y-1">
        <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent">
          Aide
        </button>
        <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent">
          Documentation
        </button>
      </div>
      <Separator className="my-2" />
      <button className="w-full rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-accent">
        Déconnexion
      </button>
    </div>
  ),
};
