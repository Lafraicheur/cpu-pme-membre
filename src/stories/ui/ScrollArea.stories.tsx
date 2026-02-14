import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const meta = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
      <div className="space-y-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="text-sm">
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const ProductList: Story = {
  render: () => (
    <ScrollArea className="h-[400px] w-[400px] rounded-md border">
      <div className="p-4 space-y-3">
        <h4 className="font-semibold">Produits disponibles</h4>
        {[
          { name: 'Café Arabica Premium', price: '15,000 XOF/kg' },
          { name: 'Cacao bio', price: '15,000 XOF/kg' },
          { name: 'Huile de palme', price: '5,000 XOF/L' },
          { name: 'Noix de cajou', price: '8,000 XOF/kg' },
          { name: 'Mangues séchées', price: '3,000 XOF/paquet' },
          { name: 'Bananes plantains', price: '1,500 XOF/kg' },
          { name: 'Ignames', price: '2,000 XOF/kg' },
          { name: 'Manioc', price: '800 XOF/kg' },
          { name: 'Riz local', price: '600 XOF/kg' },
          { name: 'Arachides', price: '1,200 XOF/kg' },
        ].map((product, i) => (
          <div key={i}>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">{product.name}</span>
              <span className="text-sm text-muted-foreground">{product.price}</span>
            </div>
            {i < 9 && <Separator />}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const TransactionHistory: Story = {
  render: () => (
    <ScrollArea className="h-[350px] w-[500px] rounded-md border">
      <div className="p-4">
        <h4 className="font-semibold mb-4">Historique des transactions</h4>
        <div className="space-y-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">Commande #CMD-2024-{1234 + i}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(2024, 11, 15 - i).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {(Math.random() * 200000 + 50000).toFixed(0)} XOF
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  ),
};

export const FormationModules: Story = {
  render: () => (
    <ScrollArea className="h-[300px] w-[450px] rounded-md border">
      <div className="p-4">
        <h4 className="font-semibold mb-3">Modules de formation</h4>
        <div className="space-y-2">
          {[
            'Introduction à la gestion financière',
            'Comptabilité pour débutants',
            'Gestion de trésorerie',
            'Analyse des états financiers',
            'Budget et prévisions',
            'Fiscalité des PME en Côte d\'Ivoire',
            'Gestion des stocks',
            'Contrôle de gestion',
            'Tableaux de bord financiers',
            'Financement et levée de fonds',
          ].map((module, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted">
              <div>
                <p className="text-sm font-medium">Module {i + 1}</p>
                <p className="text-xs text-muted-foreground">{module}</p>
              </div>
              <span className="text-xs text-muted-foreground">45 min</span>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  ),
};
