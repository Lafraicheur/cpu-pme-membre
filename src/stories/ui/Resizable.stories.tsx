import type { Meta, StoryObj } from '@storybook/react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const meta = {
  title: 'UI/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="min-h-[200px] w-[600px] rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Panneau 1</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Panneau 2</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup direction="vertical" className="h-[400px] w-[500px] rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Haut</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Bas</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const DashboardLayout: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="h-[400px] w-[700px] rounded-lg border">
      <ResizablePanel defaultSize={25} minSize={20}>
        <div className="h-full p-4">
          <h4 className="font-semibold mb-3">Menu</h4>
          <div className="space-y-2 text-sm">
            <div className="p-2 rounded hover:bg-muted cursor-pointer">Tableau de bord</div>
            <div className="p-2 rounded hover:bg-muted cursor-pointer">Marketplace</div>
            <div className="p-2 rounded hover:bg-muted cursor-pointer">Formations</div>
            <div className="p-2 rounded hover:bg-muted cursor-pointer">KYC</div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={75}>
        <div className="h-full p-4">
          <h4 className="font-semibold mb-3">Contenu principal</h4>
          <p className="text-sm text-muted-foreground">
            Redimensionnez les panneaux en glissant la poignée centrale.
          </p>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const ThreeColumns: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="h-[300px] w-[800px] rounded-lg border">
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Gauche</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Centre</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Droite</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
