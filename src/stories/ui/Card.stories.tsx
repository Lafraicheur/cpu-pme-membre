import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Titre de la carte</CardTitle>
        <CardDescription>Description de la carte</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Contenu principal de la carte avec des informations pertinentes.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithoutFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Carte sans footer</CardTitle>
        <CardDescription>Cette carte n'a pas de section footer</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu peut être affiché sans nécessiter de boutons d'action.</p>
      </CardContent>
    </Card>
  ),
};

export const SimpleContent: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p>Une carte simple avec uniquement du contenu, sans en-tête ni footer.</p>
      </CardContent>
    </Card>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>Remplissez le formulaire ci-dessous pour créer votre compte</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nom complet</label>
          <input
            type="text"
            placeholder="Jean Dupont"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="jean@exemple.com"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Annuler</Button>
        <Button>Créer</Button>
      </CardFooter>
    </Card>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader className="p-0">
        <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-t-lg" />
      </CardHeader>
      <CardContent className="pt-6">
        <CardTitle className="mb-2">Produit Example</CardTitle>
        <CardDescription>
          Description courte du produit avec ses principales caractéristiques.
        </CardDescription>
        <div className="mt-4">
          <span className="text-2xl font-bold">50 000 FCFA</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button className="flex-1">Acheter</Button>
        <Button variant="outline" className="flex-1">Détails</Button>
      </CardFooter>
    </Card>
  ),
};

export const StatCard: Story = {
  render: () => (
    <Card className="w-[280px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">2 450 000 FCFA</div>
        <p className="text-xs text-muted-foreground">+20.1% par rapport au mois dernier</p>
      </CardContent>
    </Card>
  ),
};
