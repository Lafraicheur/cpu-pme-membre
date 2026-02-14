import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const meta = {
  title: 'UI/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[400px]">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full items-center justify-center rounded-md bg-muted">
          <p className="text-sm text-muted-foreground">16:9 Aspect Ratio</p>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const ProductImage: Story = {
  render: () => (
    <div className="w-[350px]">
      <AspectRatio ratio={1 / 1}>
        <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted">
          <p className="text-sm font-medium">Image du produit</p>
          <p className="text-xs text-muted-foreground">1:1 (Carré)</p>
        </div>
      </AspectRatio>
      <div className="mt-2">
        <h4 className="font-semibold">Café Arabica Premium</h4>
        <p className="text-sm text-muted-foreground">15,000 XOF/kg</p>
      </div>
    </div>
  ),
};

export const VideoPlayer: Story = {
  render: () => (
    <div className="w-[600px]">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full flex-col items-center justify-center rounded-lg bg-black text-white">
          <div className="text-center">
            <p className="text-lg font-semibold">Formation: Gestion financière</p>
            <p className="text-sm text-muted-foreground">Vidéo de présentation</p>
            <p className="text-xs mt-2">16:9</p>
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const BannerImage: Story = {
  render: () => (
    <div className="w-[700px]">
      <AspectRatio ratio={21 / 9}>
        <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Marketplace CPU-PME</h2>
            <p>Bannière promotionnelle 21:9</p>
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const PortraitImage: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={3 / 4}>
        <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted">
          <p className="text-sm font-medium">Photo de profil</p>
          <p className="text-xs text-muted-foreground">3:4 (Portrait)</p>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const MultipleRatios: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 w-[800px]">
      <div>
        <AspectRatio ratio={1 / 1}>
          <div className="flex h-full items-center justify-center rounded bg-muted text-xs">
            1:1
          </div>
        </AspectRatio>
      </div>
      <div>
        <AspectRatio ratio={4 / 3}>
          <div className="flex h-full items-center justify-center rounded bg-muted text-xs">
            4:3
          </div>
        </AspectRatio>
      </div>
      <div>
        <AspectRatio ratio={16 / 9}>
          <div className="flex h-full items-center justify-center rounded bg-muted text-xs">
            16:9
          </div>
        </AspectRatio>
      </div>
    </div>
  ),
};
