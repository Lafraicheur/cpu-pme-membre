import type { Meta, StoryObj } from '@storybook/react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const meta = {
  title: 'UI/NavigationMenu',
  component: NavigationMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const ListItem = ({ className, title, children, ...props }: React.ComponentPropsWithoutRef<'a'> & { title: string }) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
};

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">CPU-PME</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Plateforme digitale pour les PME ivoiriennes
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/marketplace" title="Marketplace">
                Achetez et vendez des produits entre PME
              </ListItem>
              <ListItem href="/formations" title="Formations">
                Développez vos compétences professionnelles
              </ListItem>
              <ListItem href="/kyc" title="Vérification KYC">
                Validez votre identité et votre entreprise
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/about">
            À propos
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const MarketplaceNav: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Marketplace</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <ListItem title="Tous les produits" href="/marketplace/products">
                Explorez le catalogue complet
              </ListItem>
              <ListItem title="Vendeurs vérifiés" href="/marketplace/sellers">
                PME ivoiriennes certifiées
              </ListItem>
              <ListItem title="Mes commandes" href="/marketplace/orders">
                Suivez vos achats
              </ListItem>
              <ListItem title="Mes ventes" href="/marketplace/sales">
                Gérez vos produits
              </ListItem>
              <ListItem title="Catégories" href="/marketplace/categories">
                Parcourir par catégorie
              </ListItem>
              <ListItem title="Promotions" href="/marketplace/promotions">
                Offres spéciales du mois
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/cart">
            Panier
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const FormationsNav: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Formations</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[600px] md:grid-cols-2">
              <ListItem title="Gestion d'entreprise" href="/formations/management">
                Leadership et stratégie d'affaires
              </ListItem>
              <ListItem title="Marketing digital" href="/formations/marketing">
                Réseaux sociaux et communication
              </ListItem>
              <ListItem title="Comptabilité" href="/formations/accounting">
                Gestion financière pour PME
              </ListItem>
              <ListItem title="Ressources humaines" href="/formations/hr">
                Management d'équipe
              </ListItem>
              <ListItem title="Commerce international" href="/formations/trade">
                Import-export et douanes
              </ListItem>
              <ListItem title="Innovation" href="/formations/innovation">
                Transformation digitale
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Mon parcours</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <ListItem title="Mes formations" href="/my-courses">
                Formations en cours et terminées
              </ListItem>
              <ListItem title="Certificats" href="/certificates">
                Téléchargez vos attestations
              </ListItem>
              <ListItem title="Progression" href="/progress">
                Suivez votre avancement
              </ListItem>
              <ListItem title="Recommandations" href="/recommended">
                Formations suggérées
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const CompanyNav: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/">
            Accueil
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/solutions"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">Solutions PME</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Des outils adaptés aux besoins des entreprises ivoiriennes
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/solutions/marketplace" title="Marketplace B2B">
                Commerce inter-entreprises
              </ListItem>
              <ListItem href="/solutions/formations" title="Formation continue">
                Développement des compétences
              </ListItem>
              <ListItem href="/solutions/kyc" title="Conformité">
                Vérification et certification
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Ressources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <ListItem title="Documentation" href="/docs">
                Guides et tutoriels
              </ListItem>
              <ListItem title="Blog" href="/blog">
                Actualités et conseils
              </ListItem>
              <ListItem title="FAQ" href="/faq">
                Questions fréquentes
              </ListItem>
              <ListItem title="Support" href="/support">
                Contactez notre équipe
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/pricing">
            Tarifs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const AdminNav: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/admin">
            Tableau de bord
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Gestion</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <ListItem title="Membres" href="/admin/members">
                Gérer les utilisateurs
              </ListItem>
              <ListItem title="Produits" href="/admin/products">
                Modération marketplace
              </ListItem>
              <ListItem title="Formations" href="/admin/courses">
                Catalogue de formations
              </ListItem>
              <ListItem title="KYC" href="/admin/kyc">
                Vérifications en attente
              </ListItem>
              <ListItem title="Transactions" href="/admin/transactions">
                Historique financier
              </ListItem>
              <ListItem title="Rapports" href="/admin/reports">
                Statistiques et analytics
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Paramètres</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-3 p-4">
              <ListItem title="Système" href="/admin/settings/system">
                Configuration générale
              </ListItem>
              <ListItem title="Sécurité" href="/admin/settings/security">
                Paramètres de sécurité
              </ListItem>
              <ListItem title="Notifications" href="/admin/settings/notifications">
                Gestion des alertes
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const SimpleLinks: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/">
            Accueil
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/marketplace">
            Marketplace
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/formations">
            Formations
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/contact">
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithHighlight: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Plateforme</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-4">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-rose-500 to-rose-700 p-6 no-underline outline-none focus:shadow-md"
                    href="/new"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium text-white">Nouveauté</div>
                    <p className="text-sm leading-tight text-rose-50">
                      Découvrez notre nouveau service de mise en relation avec des investisseurs
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/marketplace" title="Marketplace">
                Acheter et vendre
              </ListItem>
              <ListItem href="/formations" title="Formations">
                Se former
              </ListItem>
              <ListItem href="/kyc" title="KYC">
                Vérification
              </ListItem>
              <ListItem href="/invest" title="Investissement">
                Lever des fonds
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const CategoryMenu: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Catégories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-3">
              <ListItem title="Agriculture" href="/categories/agriculture">
                Équipements et fournitures
              </ListItem>
              <ListItem title="Textile" href="/categories/textile">
                Vêtements et tissus
              </ListItem>
              <ListItem title="Alimentaire" href="/categories/food">
                Produits transformés
              </ListItem>
              <ListItem title="Construction" href="/categories/construction">
                Matériaux et outils
              </ListItem>
              <ListItem title="Technologie" href="/categories/tech">
                Équipements informatiques
              </ListItem>
              <ListItem title="Artisanat" href="/categories/craft">
                Produits artisanaux
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};
