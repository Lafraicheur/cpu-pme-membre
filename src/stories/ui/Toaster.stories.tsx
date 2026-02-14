import type { Meta, StoryObj } from '@storybook/react';
import { Toaster } from '@/components/ui/toaster';

const meta = {
  title: 'UI/Toaster',
  component: Toaster,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Description: Story = {
  render: () => (
    <div className="max-w-2xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Toaster</h2>
      <p className="text-muted-foreground">
        Composant de viewport pour afficher les notifications toast.
      </p>

      <div className="space-y-3 mt-6">
        <h3 className="text-lg font-semibold">Rôle</h3>
        <p className="text-sm text-muted-foreground">
          Le Toaster est le conteneur qui affiche les notifications toast dans votre application.
          Il doit être ajouté une seule fois à la racine de votre application.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Caractéristiques</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Position fixe en bas à droite (desktop)</li>
          <li>Position fixe en haut (mobile)</li>
          <li>Gestion automatique du stack de notifications</li>
          <li>Animations fluides</li>
          <li>Adaptatif mobile/desktop</li>
        </ul>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-semibold mb-2 text-sm">Installation</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Ajoutez le Toaster dans votre layout principal:
        </p>
        <pre className="text-xs overflow-x-auto bg-background p-3 rounded">
{`import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}`}
        </pre>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Utilisation avec useToast</h3>
        <div className="bg-muted p-4 rounded-lg">
          <pre className="text-xs overflow-x-auto">
{`import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

function MyComponent() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: "Succès!",
          description: "Votre action a été effectuée.",
        })
      }}
    >
      Afficher notification
    </Button>
  )
}`}
          </pre>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Cas d'usage CPU-PME</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Confirmation de commande sur le marketplace</li>
          <li>Notification d'approbation KYC</li>
          <li>Alerte de nouvelle formation disponible</li>
          <li>Confirmation d'ajout de produit au panier</li>
          <li>Erreurs de validation de formulaire</li>
          <li>Succès de paiement</li>
        </ul>
      </div>

      <div className="border-l-4 border-primary pl-4">
        <p className="text-sm font-medium">Note</p>
        <p className="text-sm text-muted-foreground mt-1">
          Pour une API plus simple, considérez l'utilisation du composant <strong>Sonner</strong>
          qui offre une syntaxe plus concise pour afficher des notifications.
        </p>
      </div>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <Toaster />
      <div className="max-w-2xl space-y-4">
        <h3 className="text-lg font-semibold">Le Toaster est maintenant actif</h3>
        <p className="text-sm text-muted-foreground">
          Les notifications toast apparaîtront dans le coin inférieur droit sur desktop,
          et en haut sur mobile.
        </p>
        <div className="bg-muted p-4 rounded-lg text-sm">
          <p className="font-medium mb-2">Pour tester:</p>
          <p className="text-muted-foreground">
            Utilisez le hook <code className="bg-background px-2 py-1 rounded">useToast()</code> dans
            vos composants pour afficher des notifications.
          </p>
        </div>
      </div>
    </div>
  ),
};
