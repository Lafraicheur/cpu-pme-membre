import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Store,
  Search,
  ShoppingCart,
  MapPin,
  Star,
  Shield,
  Package,
  FileText,
  Truck,
  Award,
  ChevronRight,
  Grid3X3,
  List,
  Heart,
  Eye,
  Plus,
  LayoutDashboard,
  Settings,
  BarChart3,
  CreditCard,
  AlertTriangle,
  Users,
  RotateCcw,
  MessageSquare,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { regions } from "@/data/regions";

// Import des composants
import { MarketplaceOverview } from "@/components/marketplace/MarketplaceOverview";
import { VendeurOnboarding } from "@/components/marketplace/VendeurOnboarding";
import { ProductWizard } from "@/components/marketplace/ProductWizard";
import { MesProduits } from "@/components/marketplace/MesProduits";
import { VendeurCommandes } from "@/components/marketplace/VendeurCommandes";
import { RFQVendeur } from "@/components/marketplace/RFQVendeur";
import { MadeInCI } from "@/components/marketplace/MadeInCI";
import { AcheteurCommandes } from "@/components/marketplace/AcheteurCommandes";
import { RFQAcheteur } from "@/components/marketplace/RFQAcheteur";
import { VendeurPaiements } from "@/components/marketplace/VendeurPaiements";
import { RetoursLitiges } from "@/components/marketplace/RetoursLitiges";
import { GestionStock } from "@/components/marketplace/GestionStock";
import { AdminMarketplace } from "@/components/marketplace/AdminMarketplace";
import { PanierCheckout } from "@/components/marketplace/PanierCheckout";
import { BoutiqueVendeur } from "@/components/marketplace/BoutiqueVendeur";
import { ExpeditionsVendeur } from "@/components/marketplace/ExpeditionsVendeur";
import { ProduitsReglementes } from "@/components/marketplace/ProduitsReglementes";
import { HistoriqueTransactions } from "@/components/marketplace/HistoriqueTransactions";
import { RFQMessaging } from "@/components/marketplace/RFQMessaging";
import { NotificationsRFQ } from "@/components/marketplace/NotificationsRFQ";
import { FacturationVedette } from "@/components/marketplace/FacturationVedette";
import { DashboardCommissions } from "@/components/marketplace/DashboardCommissions";
import { ReclamationsAcheteur } from "@/components/marketplace/ReclamationsAcheteur";
import { NotificationsRetoursLitiges } from "@/components/marketplace/NotificationsRetoursLitiges";
import { CertificationBoutique } from "@/components/marketplace/CertificationBoutique";

// Mock data pour les produits
const mockProducts = [
  {
    id: 1,
    name: "Cacao Premium Grade A",
    seller: "Coopérative Aboisso Cacao",
    price: 850000,
    unit: "tonne",
    image: "🍫",
    rating: 4.8,
    reviews: 124,
    location: "Aboisso",
    verified: true,
    madeInCI: "Or",
    category: "Produits",
    stock: 50,
  },
  {
    id: 2,
    name: "Attiéké séché - 25kg",
    seller: "Femmes de Dabou SARL",
    price: 15000,
    unit: "sac",
    image: "🌾",
    rating: 4.6,
    reviews: 89,
    location: "Dabou",
    verified: true,
    madeInCI: "Argent",
    category: "Produits",
    stock: 200,
  },
  {
    id: 3,
    name: "Service de transport frigorifique",
    seller: "TransFroid CI",
    price: 75000,
    unit: "trajet",
    image: "🚛",
    rating: 4.9,
    reviews: 56,
    location: "Abidjan",
    verified: true,
    madeInCI: null,
    category: "Services",
    stock: null,
  },
  {
    id: 4,
    name: "Huile de palme raffinée - 20L",
    seller: "Palmeraie du Sud",
    price: 25000,
    unit: "bidon",
    image: "🫒",
    rating: 4.5,
    reviews: 203,
    location: "San-Pédro",
    verified: true,
    madeInCI: "Bronze",
    category: "Produits",
    stock: 150,
  },
];

const madeInCIBadges = {
  Or: { color: "bg-primary text-primary-foreground", label: "Made in CI - Or" },
  Argent: { color: "bg-secondary text-secondary-foreground", label: "Made in CI - Argent" },
  Bronze: { color: "bg-amber-600 text-white", label: "Made in CI - Bronze" },
  Innovation: { color: "bg-cyan-500 text-white", label: "Innovation Ivoire" },
};

type MenuSection = 
  | "apercu" 
  | "panier"
  | "mes-commandes" 
  | "mes-devis"
  | "messagerie-rfq"
  | "retours-acheteur"
  | "historique-achats"
  | "onboarding-vendeur"
  | "ma-boutique"
  | "certification-boutique"
  | "mes-produits"
  | "gestion-stock"
  | "commandes-vendeur"
  | "expeditions"
  | "retours-litiges"
  | "rfq-vendeur"
  | "paiements"
  | "made-in-ci"
  | "produits-reglementes"
  | "historique-ventes"
  | "facturation-vedette"
  | "dashboard-commissions"
  | "analytics"
  | "parametres"
  | "admin";

export default function Marketplace() {
  const [activeSection, setActiveSection] = useState<MenuSection>("apercu");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [cart, setCart] = useState<number[]>([]);
  const [showProductWizard, setShowProductWizard] = useState(false);
  const [isVendeur] = useState(true); // Mock - à remplacer par vraie logique

  const addToCart = (productId: number) => {
    if (!cart.includes(productId)) {
      setCart([...cart, productId]);
    }
  };

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesRegion = selectedRegion === "all" || 
      regions.some(r => r === selectedRegion && product.location);
    return matchesSearch && matchesCategory && matchesRegion;
  });

  const menuItems = {
    acheter: [
      { id: "mes-commandes" as MenuSection, label: "Mes commandes", icon: ShoppingCart },
      { id: "retours-acheteur" as MenuSection, label: "Retours & réclamations", icon: RotateCcw },
      { id: "mes-devis" as MenuSection, label: "Mes devis (RFQ)", icon: FileText },
      { id: "messagerie-rfq" as MenuSection, label: "Négociations RFQ", icon: MessageSquare },
      { id: "historique-achats" as MenuSection, label: "Historique achats", icon: FileText },
      { id: "panier" as MenuSection, label: "Panier", icon: ShoppingCart },
    ],
    vendre: [
      { id: "onboarding-vendeur" as MenuSection, label: "Onboarding vendeur", icon: Users },
      { id: "ma-boutique" as MenuSection, label: "Ma boutique", icon: Store },
      { id: "mes-produits" as MenuSection, label: "Catalogue produits", icon: Package },
      { id: "gestion-stock" as MenuSection, label: "Gestion du stock", icon: BarChart3 },
      { id: "commandes-vendeur" as MenuSection, label: "Commandes à traiter", icon: ShoppingCart },
      { id: "rfq-vendeur" as MenuSection, label: "RFQ reçues", icon: FileText },
      { id: "expeditions" as MenuSection, label: "Expéditions", icon: Truck },
      { id: "retours-litiges" as MenuSection, label: "Retours & Litiges", icon: RotateCcw },
      { id: "paiements" as MenuSection, label: "Paiements", icon: CreditCard },
      { id: "certification-boutique" as MenuSection, label: "Certification boutique", icon: BadgeCheck },
      { id: "made-in-ci" as MenuSection, label: "Made in CI (produits)", icon: Award },
      { id: "produits-reglementes" as MenuSection, label: "Produits réglementés", icon: AlertTriangle },
      { id: "historique-ventes" as MenuSection, label: "Historique ventes", icon: FileText },
      { id: "facturation-vedette" as MenuSection, label: "Facturation vedette", icon: FileText },
      { id: "dashboard-commissions" as MenuSection, label: "Dashboard commissions", icon: BarChart3 },
      { id: "analytics" as MenuSection, label: "Analytics", icon: BarChart3 },
    ],
    admin: [
      { id: "admin" as MenuSection, label: "Administration", icon: Settings },
    ],
  };

  const renderContent = () => {
    switch (activeSection) {
      case "apercu":
        return <MarketplaceOverview isVendeur={isVendeur} onNavigate={(tab) => setActiveSection(tab as MenuSection)} />;

      case "mes-commandes":
        return <AcheteurCommandes />;
      
      case "historique-achats":
      case "historique-ventes":
        return <HistoriqueTransactions />;
      
      case "mes-devis":
        return <RFQAcheteur />;
      
      case "messagerie-rfq":
        return <RFQMessaging />;
      
      case "panier":
        return <PanierCheckout />;
      
      case "onboarding-vendeur":
        return <VendeurOnboarding />;
      
      case "ma-boutique":
        return <BoutiqueVendeur />;
      
      case "mes-produits":
        return <MesProduits onOpenWizard={() => setShowProductWizard(true)} />;
      
      case "gestion-stock":
        return <GestionStock />;
      
      case "commandes-vendeur":
        return <VendeurCommandes />;
      
      case "expeditions":
        return <ExpeditionsVendeur />;
      
      case "rfq-vendeur":
        return <RFQVendeur />;
      
      case "made-in-ci":
        return <MadeInCI />;
      
      case "certification-boutique":
        return <CertificationBoutique />;
      
      case "paiements":
        return <VendeurPaiements />;
      
      case "retours-litiges":
        return <RetoursLitiges />;
      
      case "retours-acheteur":
        return <ReclamationsAcheteur />;
      
      case "produits-reglementes":
        return <ProduitsReglementes />;
      
      case "facturation-vedette":
        return <FacturationVedette />;
      
      case "dashboard-commissions":
        return <DashboardCommissions />;
      
      case "admin":
        return <AdminMarketplace />;
      
      default:
        return (
          <Card>
            <CardContent className="p-12 text-center">
              <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">Section en construction</h3>
              <p className="text-sm text-muted-foreground">Cette fonctionnalité sera bientôt disponible</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        {/* Sidebar Menu */}
        <div className="w-64 shrink-0 hidden lg:block">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="space-y-1">
                  <Button
                    variant={activeSection === "apercu" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveSection("apercu")}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Aperçu
                  </Button>

                  <div className="pt-4 pb-2">
                    <p className="text-xs font-semibold text-muted-foreground px-3">ACHETER</p>
                  </div>
                  {menuItems.acheter.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeSection === item.id ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2"
                        onClick={() => setActiveSection(item.id)}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    );
                  })}

                  {isVendeur && (
                    <>
                      <div className="pt-4 pb-2">
                        <p className="text-xs font-semibold text-muted-foreground px-3">VENDRE</p>
                      </div>
                      {menuItems.vendre.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Button
                            key={item.id}
                            variant={activeSection === item.id ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2"
                            onClick={() => setActiveSection(item.id)}
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Button>
                        );
                      })}
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Store className="w-7 h-7 text-primary" />
                Marketplace CPU-PME
              </h1>
              <p className="text-muted-foreground text-sm">Achetez et vendez entre membres</p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationsRetoursLitiges onNavigate={(section) => setActiveSection(section as MenuSection)} />
              <NotificationsRFQ onNavigate={(section) => setActiveSection(section as MenuSection)} />
              <Button variant="outline" className="gap-2 relative" onClick={() => setActiveSection("panier")}>
                <ShoppingCart className="w-4 h-4" />
                Panier
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary">
                    {cart.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>

      <ProductWizard 
        open={showProductWizard} 
        onOpenChange={setShowProductWizard}
        onSubmit={(data) => console.log("Product submitted:", data)}
      />
    </DashboardLayout>
  );
}
