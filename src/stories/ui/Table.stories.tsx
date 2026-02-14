import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Table className="w-[600px]">
      <TableCaption>Liste des dernières transactions</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Montant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>TRX-001</TableCell>
          <TableCell>Complétée</TableCell>
          <TableCell className="text-right">230,000 XOF</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>TRX-002</TableCell>
          <TableCell>En attente</TableCell>
          <TableCell className="text-right">150,000 XOF</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const ProductsTable: Story = {
  render: () => (
    <div className="w-[800px]">
      <Table>
        <TableCaption>Vos produits sur le marketplace</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Café Arabica Premium</TableCell>
            <TableCell>Agriculture</TableCell>
            <TableCell>15,000 XOF/kg</TableCell>
            <TableCell>45 kg</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">Modifier</Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Cacao bio</TableCell>
            <TableCell>Agriculture</TableCell>
            <TableCell>15,000 XOF/kg</TableCell>
            <TableCell>30 kg</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">Modifier</Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Huile de palme</TableCell>
            <TableCell>Agriculture</TableCell>
            <TableCell>5,000 XOF/L</TableCell>
            <TableCell className="text-destructive">5 L</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">Modifier</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};

export const OrdersTable: Story = {
  render: () => (
    <div className="w-[900px]">
      <Table>
        <TableCaption>Historique des commandes</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Commande</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">#CMD-2024-1234</TableCell>
            <TableCell>Kouassi Jean</TableCell>
            <TableCell>15/12/2024</TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Livrée
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium">230,000 XOF</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">#CMD-2024-1235</TableCell>
            <TableCell>Aya Sanogo</TableCell>
            <TableCell>16/12/2024</TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                En cours
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium">150,000 XOF</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">#CMD-2024-1236</TableCell>
            <TableCell>Yao N'Guessan</TableCell>
            <TableCell>17/12/2024</TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                En attente
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium">75,000 XOF</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};

export const MembersTable: Story = {
  render: () => (
    <div className="w-[800px]">
      <Table>
        <TableCaption>Membres de votre entreprise</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Poste</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Statut KYC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Amadou Koné</TableCell>
            <TableCell>Directeur Général</TableCell>
            <TableCell>a.kone@pme-ci.com</TableCell>
            <TableCell>
              <Badge className="bg-green-600">Vérifié</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Fatou Traoré</TableCell>
            <TableCell>Chef Comptable</TableCell>
            <TableCell>f.traore@pme-ci.com</TableCell>
            <TableCell>
              <Badge className="bg-green-600">Vérifié</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Yao N'Guessan</TableCell>
            <TableCell>Resp. Marketing</TableCell>
            <TableCell>y.nguessan@pme-ci.com</TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                En attente
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};

export const FormationsEnrolled: Story = {
  render: () => (
    <div className="w-[900px]">
      <Table>
        <TableCaption>Vos formations en cours</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Formation</TableHead>
            <TableHead>Durée</TableHead>
            <TableHead>Progression</TableHead>
            <TableHead>Date de fin</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Gestion financière pour PME</TableCell>
            <TableCell>6 semaines</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '65%' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">65%</span>
              </div>
            </TableCell>
            <TableCell>25/01/2025</TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm">Continuer</Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Marketing digital</TableCell>
            <TableCell>4 semaines</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '30%' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">30%</span>
              </div>
            </TableCell>
            <TableCell>15/01/2025</TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm">Continuer</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
