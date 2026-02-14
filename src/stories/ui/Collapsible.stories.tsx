import type { Meta, StoryObj } from '@storybook/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';

const meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[400px] space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">
            @pme_ivoirienne a 3 produits
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-2 text-sm">
          Café Arabica Premium
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-2 text-sm">
            Cacao bio
          </div>
          <div className="rounded-md border px-4 py-2 text-sm">
            Huile de palme
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const ProductFilter: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[350px] space-y-2">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>Filtres avancés</span>
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border p-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Prix minimum</label>
              <input className="w-full mt-1 rounded-md border px-3 py-2 text-sm" placeholder="5000 XOF" />
            </div>
            <div>
              <label className="text-sm font-medium">Prix maximum</label>
              <input className="w-full mt-1 rounded-md border px-3 py-2 text-sm" placeholder="50000 XOF" />
            </div>
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <input className="w-full mt-1 rounded-md border px-3 py-2 text-sm" placeholder="Agriculture" />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const OrderDetails: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[500px]">
        <div className="rounded-lg border">
          <div className="flex items-center justify-between p-4">
            <div>
              <h4 className="font-semibold">Commande #CMD-2024-1234</h4>
              <p className="text-sm text-muted-foreground">230,000 XOF</p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Café Arabica premium - 10kg</span>
                <span>150,000 XOF</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cacao bio - 5kg</span>
                <span>75,000 XOF</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livraison</span>
                <span>5,000 XOF</span>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  },
};

export const FormationModules: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[500px]">
        <div className="rounded-lg border">
          <div className="flex items-center justify-between p-4">
            <div>
              <h4 className="font-semibold">Gestion financière pour PME</h4>
              <p className="text-sm text-muted-foreground">10 modules • 6 semaines</p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? 'Masquer' : 'Voir'} les modules
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="border-t p-4 space-y-2">
              {[
                'Introduction à la comptabilité',
                'Gestion de trésorerie',
                'Analyse financière',
                'Budget prévisionnel',
                'Fiscalité des PME',
              ].map((module, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                  <span className="text-sm">{i + 1}. {module}</span>
                  <span className="text-xs text-muted-foreground">45 min</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  },
};
