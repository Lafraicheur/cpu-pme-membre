import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const meta = {
  title: 'UI/Chart',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Description: Story = {
  render: () => (
    <div className="max-w-2xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Chart</h2>
      <p className="text-muted-foreground">
        Composants de graphiques utilisant Recharts pour visualiser des données.
      </p>

      <div className="space-y-3 mt-6">
        <h3 className="text-lg font-semibold">Types de graphiques disponibles</h3>
        <div className="grid gap-2">
          <div className="border rounded p-3">
            <p className="font-medium">Bar Chart</p>
            <p className="text-sm text-muted-foreground">
              Graphique à barres pour comparer des valeurs
            </p>
          </div>
          <div className="border rounded p-3">
            <p className="font-medium">Line Chart</p>
            <p className="text-sm text-muted-foreground">
              Graphique linéaire pour suivre les tendances
            </p>
          </div>
          <div className="border rounded p-3">
            <p className="font-medium">Pie Chart</p>
            <p className="text-sm text-muted-foreground">
              Graphique circulaire pour les proportions
            </p>
          </div>
          <div className="border rounded p-3">
            <p className="font-medium">Area Chart</p>
            <p className="text-sm text-muted-foreground">
              Graphique d'aire pour visualiser les volumes
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Cas d'usage CPU-PME</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Statistiques de ventes sur le marketplace</li>
          <li>Évolution du chiffre d'affaires</li>
          <li>Répartition des produits par catégorie</li>
          <li>Progression des formations</li>
          <li>Analyse des performances mensuelles</li>
          <li>Taux de conversion des commandes</li>
        </ul>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-semibold mb-2 text-sm">Installation</h4>
        <pre className="text-xs overflow-x-auto">
{`npm install recharts`}
        </pre>
      </div>
    </div>
  ),
};

export const SalesChart: Story = {
  render: () => (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Ventes mensuelles</CardTitle>
        <CardDescription>
          Évolution des ventes sur les 6 derniers mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded">
          <p className="text-sm text-muted-foreground">
            Graphique des ventes (Recharts)
          </p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold">2.45M XOF</div>
            <div className="text-xs text-muted-foreground">Ce mois</div>
          </div>
          <div>
            <div className="font-semibold">+23%</div>
            <div className="text-xs text-muted-foreground">Croissance</div>
          </div>
          <div>
            <div className="font-semibold">156</div>
            <div className="text-xs text-muted-foreground">Commandes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const CategoryDistribution: Story = {
  render: () => (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Répartition par catégorie</CardTitle>
        <CardDescription>
          Distribution des produits sur le marketplace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] flex items-center justify-center border-2 border-dashed rounded">
          <p className="text-sm text-muted-foreground">
            Graphique circulaire (Recharts)
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span>Agriculture (45%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span>Textile (30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span>Artisanat (15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
            <span>Autres (10%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};
