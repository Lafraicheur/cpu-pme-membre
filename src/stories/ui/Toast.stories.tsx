import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from '@/components/ui/toast';

const meta = {
  title: 'UI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Description: Story = {
  render: () => (
    <div className="max-w-2xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Toast</h2>
      <p className="text-muted-foreground">
        Composant de notification toast utilisant Radix UI Toast Primitives.
      </p>

      <div className="space-y-3 mt-6">
        <h3 className="text-lg font-semibold">Utilisation recommandée</h3>
        <p className="text-sm text-muted-foreground">
          Pour afficher des toasts, il est recommandé d'utiliser le composant <strong>Sonner</strong> qui
          offre une API plus simple et moderne. Le composant Toast est fourni pour les cas avancés
          nécessitant un contrôle plus fin.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Caractéristiques</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Notifications temporaires</li>
          <li>Support des variantes (default, destructive)</li>
          <li>Actions personnalisables</li>
          <li>Animations d'entrée/sortie</li>
          <li>Position configurable</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Composants associés</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="border rounded p-2">
            <code className="text-xs">Toast</code>
            <p className="text-xs text-muted-foreground mt-1">Composant principal</p>
          </div>
          <div className="border rounded p-2">
            <code className="text-xs">ToastAction</code>
            <p className="text-xs text-muted-foreground mt-1">Bouton d'action</p>
          </div>
          <div className="border rounded p-2">
            <code className="text-xs">ToastClose</code>
            <p className="text-xs text-muted-foreground mt-1">Bouton de fermeture</p>
          </div>
          <div className="border rounded p-2">
            <code className="text-xs">ToastTitle</code>
            <p className="text-xs text-muted-foreground mt-1">Titre</p>
          </div>
          <div className="border rounded p-2">
            <code className="text-xs">ToastDescription</code>
            <p className="text-xs text-muted-foreground mt-1">Description</p>
          </div>
          <div className="border rounded p-2">
            <code className="text-xs">ToastProvider</code>
            <p className="text-xs text-muted-foreground mt-1">Fournisseur</p>
          </div>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm font-medium mb-2">Note importante</p>
        <p className="text-sm text-muted-foreground">
          Pour des exemples concrets d'utilisation de notifications toast,
          consultez la documentation du composant <strong>Sonner</strong>.
        </p>
      </div>
    </div>
  ),
};

export const UsageExample: Story = {
  render: () => (
    <div className="max-w-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Exemple d'utilisation</h3>
      <div className="bg-muted p-4 rounded-lg">
        <pre className="text-xs overflow-x-auto">
{`import { useToast } from "@/components/ui/use-toast"

function MyComponent() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: "Commande confirmée",
          description: "Votre commande a été traitée.",
        })
      }}
    >
      Afficher toast
    </Button>
  )
}`}
        </pre>
      </div>
    </div>
  ),
};
