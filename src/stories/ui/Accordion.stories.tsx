import type { Meta, StoryObj } from '@storybook/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[500px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Est-ce accessible?</AccordionTrigger>
        <AccordionContent>
          Oui. Le composant respecte les normes WAI-ARIA pour l'accessibilité.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Est-ce stylisable?</AccordionTrigger>
        <AccordionContent>
          Oui. Vous pouvez personnaliser l'apparence avec des classes CSS.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Est-ce animé?</AccordionTrigger>
        <AccordionContent>
          Oui. Les transitions sont fluides et personnalisables.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const FAQ: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[600px]">
      <AccordionItem value="marketplace">
        <AccordionTrigger>Comment vendre sur le marketplace?</AccordionTrigger>
        <AccordionContent>
          Pour vendre sur le marketplace CPU-PME, vous devez d'abord compléter votre vérification KYC.
          Ensuite, accédez à votre tableau de bord, cliquez sur "Ajouter un produit" et remplissez
          les informations requises (nom, description, prix, images, etc.).
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="kyc">
        <AccordionTrigger>Qu'est-ce que la vérification KYC?</AccordionTrigger>
        <AccordionContent>
          KYC (Know Your Customer) est un processus de vérification d'identité obligatoire pour
          garantir la sécurité de la plateforme. Vous devrez fournir une pièce d'identité valide,
          un justificatif d'adresse et des documents professionnels pour votre entreprise.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="formations">
        <AccordionTrigger>Comment accéder aux formations?</AccordionTrigger>
        <AccordionContent>
          Les formations sont disponibles dans la section "Formations" de votre tableau de bord.
          Parcourez le catalogue, sélectionnez une formation qui vous intéresse et cliquez sur
          "S'inscrire". Certaines formations sont gratuites, d'autres sont payantes.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="paiement">
        <AccordionTrigger>Quels moyens de paiement sont acceptés?</AccordionTrigger>
        <AccordionContent>
          CPU-PME accepte les paiements par Mobile Money (Orange Money, MTN Money, Moov Money),
          carte bancaire et virement bancaire. Tous les paiements sont sécurisés et cryptés.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const ProductFeatures: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[600px]">
      <AccordionItem value="description">
        <AccordionTrigger>Description du produit</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-sm">
            <p>
              Café Arabica cultivé dans les montagnes de l'ouest ivoirien à 1200m d'altitude.
              Torréfaction artisanale pour préserver tous les arômes.
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>100% Arabica</li>
              <li>Torréfaction artisanale</li>
              <li>Origine: Man, Côte d'Ivoire</li>
              <li>Conditionné sous vide</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="livraison">
        <AccordionTrigger>Livraison et retours</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-sm">
            <p><strong>Livraison:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Abidjan: 2-3 jours ouvrables (2,000 XOF)</li>
              <li>Autres villes: 5-7 jours ouvrables (5,000 XOF)</li>
              <li>Livraison gratuite à partir de 50,000 XOF</li>
            </ul>
            <p className="mt-2"><strong>Retours:</strong></p>
            <p className="text-muted-foreground">
              Retours acceptés sous 7 jours si le produit est intact et non ouvert.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="vendeur">
        <AccordionTrigger>À propos du vendeur</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-sm">
            <p><strong>PME Ivoirienne SARL</strong></p>
            <p className="text-muted-foreground">
              Producteur et transformateur de café ivoirien depuis 2010. Membre vérifié CPU-PME.
            </p>
            <div className="flex gap-4 mt-2">
              <div>
                <div className="font-semibold">156</div>
                <div className="text-xs text-muted-foreground">Produits</div>
              </div>
              <div>
                <div className="font-semibold">4.8/5</div>
                <div className="text-xs text-muted-foreground">Note</div>
              </div>
              <div>
                <div className="font-semibold">2.4k</div>
                <div className="text-xs text-muted-foreground">Ventes</div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const FormationCurriculum: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[600px]">
      <AccordionItem value="module-1">
        <AccordionTrigger>Module 1: Introduction à la gestion financière</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Durée: 1 semaine</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Les bases de la comptabilité</li>
              <li>Comprendre le bilan et le compte de résultat</li>
              <li>Les obligations comptables des PME en Côte d'Ivoire</li>
              <li>Quiz de validation</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="module-2">
        <AccordionTrigger>Module 2: Gestion de trésorerie</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Durée: 1 semaine</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Plan de trésorerie prévisionnel</li>
              <li>Suivi des encaissements et décaissements</li>
              <li>Optimisation du besoin en fonds de roulement</li>
              <li>Étude de cas pratique</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="module-3">
        <AccordionTrigger>Module 3: Analyse financière</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Durée: 2 semaines</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ratios financiers clés</li>
              <li>Analyse de la rentabilité</li>
              <li>Tableaux de bord financiers</li>
              <li>Projet pratique</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const MultipleOpen: Story = {
  render: () => (
    <Accordion type="multiple" className="w-[600px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>
          Contenu de la section 1. Vous pouvez ouvrir plusieurs sections en même temps.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>
          Contenu de la section 2.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section 3</AccordionTrigger>
        <AccordionContent>
          Contenu de la section 3.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
