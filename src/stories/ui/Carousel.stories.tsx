import type { Meta, StoryObj } from '@storybook/react';
import { Carousel } from '@/components/ui/carousel';

const meta = {
  title: 'UI/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Description: Story = {
  render: () => (
    <div className="max-w-2xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Carousel</h2>
      <p className="text-muted-foreground">
        Composant carousel pour afficher une collection d'éléments avec navigation.
      </p>

      <div className="space-y-3 mt-6">
        <h3 className="text-lg font-semibold">Caractéristiques</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Navigation par flèches</li>
          <li>Indicateurs de pagination</li>
          <li>Support tactile pour mobile</li>
          <li>Défilement automatique optionnel</li>
          <li>Personnalisable</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Cas d'usage CPU-PME</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Galerie d'images de produits sur le marketplace</li>
          <li>Bannières promotionnelles</li>
          <li>Témoignages clients</li>
          <li>Présentation des formations</li>
          <li>Portfolio de vendeurs</li>
        </ul>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-semibold mb-2 text-sm">Exemple d'utilisation</h4>
        <pre className="text-xs overflow-x-auto">
{`import { Carousel } from "@/components/ui/carousel"

<Carousel>
  <CarouselContent>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
    <CarouselItem>Slide 3</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
        </pre>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Exemples</h3>
        <div className="grid gap-2 text-sm">
          <div className="border rounded p-3">
            <p className="font-medium">Galerie de produits</p>
            <p className="text-xs text-muted-foreground">
              Afficher plusieurs images d'un produit
            </p>
          </div>
          <div className="border rounded p-3">
            <p className="font-medium">Promotions</p>
            <p className="text-xs text-muted-foreground">
              Bannières publicitaires défilantes
            </p>
          </div>
          <div className="border rounded p-3">
            <p className="font-medium">Formations vedettes</p>
            <p className="text-xs text-muted-foreground">
              Mise en avant des formations populaires
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};
