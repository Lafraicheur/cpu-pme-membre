import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Package,
  Briefcase,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Archive,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Ban,
  Award,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Truck,
  Star,
  Image as ImageIcon,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductWizard } from "./ProductWizard";

type ProductStatus = "Draft" | "InModeration" | "Published" | "Rejected" | "NeedsChanges" | "Paused" | "OutOfStock" | "Archived";

interface Product {
  id: string;
  type: "product" | "service";
  nom: string;
  categorie: string;
  sousCategorie: string;
  prix: number;
  unite: string;
  stock: number | null;
  status: ProductStatus;
  madeInCI: "or" | "argent" | "bronze" | "innovation" | null;
  produitReglemente: boolean;
  statutReglementaire: "pending" | "approved" | "rejected" | null;
  image: string;
  vues: number;
  commandes: number;
  chiffreAffaires: number;
  createdAt: string;
  updatedAt: string;
  motifRejet?: string;
}

const statusConfig: Record<ProductStatus, { label: string; color: string; icon: typeof CheckCircle2; bgColor: string }> = {
  Draft: { label: "Brouillon", color: "text-muted-foreground", icon: Clock, bgColor: "bg-muted" },
  InModeration: { label: "En modération", color: "text-blue-500", icon: Clock, bgColor: "bg-blue-500/10" },
  Published: { label: "Publié", color: "text-green-500", icon: CheckCircle2, bgColor: "bg-green-500/10" },
  Rejected: { label: "Refusé", color: "text-destructive", icon: XCircle, bgColor: "bg-destructive/10" },
  NeedsChanges: { label: "À corriger", color: "text-amber-500", icon: AlertCircle, bgColor: "bg-amber-500/10" },
  Paused: { label: "En pause", color: "text-purple-500", icon: Ban, bgColor: "bg-purple-500/10" },
  OutOfStock: { label: "Rupture", color: "text-red-500", icon: AlertTriangle, bgColor: "bg-red-500/10" },
  Archived: { label: "Archivé", color: "text-muted-foreground", icon: Archive, bgColor: "bg-muted" },
};

const madeInCIBadges = {
  or: { color: "bg-primary text-primary-foreground", label: "Made in CI - Or" },
  argent: { color: "bg-secondary text-secondary-foreground", label: "Made in CI - Argent" },
  bronze: { color: "bg-amber-600 text-white", label: "Made in CI - Bronze" },
  innovation: { color: "bg-cyan-500 text-white", label: "Innovation Ivoire" },
};

// Mock products data
const mockProducts: Product[] = [
  {
    id: "1",
    type: "product",
    nom: "Cacao Premium Grade A",
    categorie: "Agro-industrie",
    sousCategorie: "Cacao transformé",
    prix: 850000,
    unite: "tonne",
    stock: 50,
    status: "Published",
    madeInCI: "or",
    produitReglemente: false,
    statutReglementaire: null,
    image: "🍫",
    vues: 1245,
    commandes: 32,
    chiffreAffaires: 27200000,
    createdAt: "2024-01-15",
    updatedAt: "2024-03-10",
  },
  {
    id: "2",
    type: "product",
    nom: "Attiéké séché - 25kg",
    categorie: "Agro-industrie",
    sousCategorie: "Produits vivriers",
    prix: 15000,
    unite: "sac",
    stock: 5,
    status: "OutOfStock",
    madeInCI: "argent",
    produitReglemente: true,
    statutReglementaire: "approved",
    image: "🌾",
    vues: 890,
    commandes: 156,
    chiffreAffaires: 2340000,
    createdAt: "2024-02-20",
    updatedAt: "2024-03-12",
  },
  {
    id: "3",
    type: "service",
    nom: "Transport frigorifique national",
    categorie: "Logistique",
    sousCategorie: "Transport froid",
    prix: 75000,
    unite: "trajet",
    stock: null,
    status: "Published",
    madeInCI: null,
    produitReglemente: false,
    statutReglementaire: null,
    image: "🚛",
    vues: 567,
    commandes: 24,
    chiffreAffaires: 1800000,
    createdAt: "2024-01-28",
    updatedAt: "2024-03-05",
  },
  {
    id: "4",
    type: "product",
    nom: "Huile de palme raffinée - 20L",
    categorie: "Agro-industrie",
    sousCategorie: "Huiles végétales",
    prix: 25000,
    unite: "bidon",
    stock: 0,
    status: "InModeration",
    madeInCI: "bronze",
    produitReglemente: true,
    statutReglementaire: "pending",
    image: "🫒",
    vues: 0,
    commandes: 0,
    chiffreAffaires: 0,
    createdAt: "2024-03-14",
    updatedAt: "2024-03-14",
  },
  {
    id: "5",
    type: "product",
    nom: "Café torréfié premium",
    categorie: "Agro-industrie",
    sousCategorie: "Café",
    prix: 12500,
    unite: "kg",
    stock: 200,
    status: "Rejected",
    madeInCI: "or",
    produitReglemente: false,
    statutReglementaire: null,
    image: "☕",
    vues: 0,
    commandes: 0,
    chiffreAffaires: 0,
    createdAt: "2024-03-12",
    updatedAt: "2024-03-13",
    motifRejet: "Photos non conformes - qualité insuffisante et présence de filigrane",
  },
  {
    id: "6",
    type: "service",
    nom: "Conseil en certification bio",
    categorie: "Conseils",
    sousCategorie: "Certification",
    prix: 150000,
    unite: "mission",
    stock: null,
    status: "Draft",
    madeInCI: null,
    produitReglemente: false,
    statutReglementaire: null,
    image: "📋",
    vues: 0,
    commandes: 0,
    chiffreAffaires: 0,
    createdAt: "2024-03-15",
    updatedAt: "2024-03-15",
  },
];

interface MesProduitsProps {
  onOpenWizard: () => void;
}

export function MesProduits({ onOpenWizard }: MesProduitsProps) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Stats
  const stats = {
    total: products.length,
    published: products.filter(p => p.status === "Published").length,
    inModeration: products.filter(p => p.status === "InModeration").length,
    drafts: products.filter(p => p.status === "Draft").length,
    issues: products.filter(p => ["Rejected", "NeedsChanges", "OutOfStock"].includes(p.status)).length,
    totalVues: products.reduce((acc, p) => acc + p.vues, 0),
    totalCommandes: products.reduce((acc, p) => acc + p.commandes, 0),
    totalCA: products.reduce((acc, p) => acc + p.chiffreAffaires, 0),
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categorie.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = (productId: string, newStatus: ProductStatus) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : p
    ));
  };

  const handleDuplicate = (product: Product) => {
    const newProduct: Product = {
      ...product,
      id: `${Date.now()}`,
      nom: `${product.nom} (copie)`,
      status: "Draft",
      vues: 0,
      commandes: 0,
      chiffreAffaires: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setProducts([newProduct, ...products]);
  };

  const handleDelete = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    setShowDeleteDialog(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Produits/Services</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              <Badge variant="outline" className="bg-green-500/10 text-green-600">{stats.published} publiés</Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600">{stats.inModeration} en attente</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Eye className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalVues.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Vues totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCommandes}</p>
                <p className="text-sm text-muted-foreground">Commandes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(stats.totalCA / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground">CA (FCFA)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {stats.issues > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div className="flex-1">
                <p className="font-medium">{stats.issues} produit(s) nécessitent votre attention</p>
                <p className="text-sm text-muted-foreground">
                  Produits refusés, à corriger ou en rupture de stock
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStatusFilter("issues")}>
                Voir les alertes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit ou service..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Published">Publiés</SelectItem>
                <SelectItem value="InModeration">En modération</SelectItem>
                <SelectItem value="Draft">Brouillons</SelectItem>
                <SelectItem value="Rejected">Refusés</SelectItem>
                <SelectItem value="NeedsChanges">À corriger</SelectItem>
                <SelectItem value="OutOfStock">Rupture</SelectItem>
                <SelectItem value="Paused">En pause</SelectItem>
                <SelectItem value="Archived">Archivés</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="product">Produits</SelectItem>
                <SelectItem value="service">Services</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
              <Button onClick={onOpenWizard}>
                <Plus className="w-4 h-4 mr-1" />
                Nouveau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" 
                ? "Modifiez vos filtres pour voir plus de résultats"
                : "Publiez votre premier produit ou service"}
            </p>
            <Button onClick={onOpenWizard}>
              <Plus className="w-4 h-4 mr-1" />
              Ajouter un produit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const status = statusConfig[product.status];
            const StatusIcon = status.icon;

            return (
              <Card key={product.id} className="group hover:shadow-md transition-all">
                <CardContent className="p-0">
                  {/* Image / Header */}
                  <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-6 flex items-center justify-center h-32 rounded-t-lg">
                    <span className="text-5xl">{product.image}</span>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <Badge className={cn(status.bgColor, status.color, "border-0")}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      {product.madeInCI && (
                        <Badge className={madeInCIBadges[product.madeInCI].color}>
                          <Award className="w-3 h-3 mr-1" />
                          {madeInCIBadges[product.madeInCI].label}
                        </Badge>
                      )}
                    </div>

                    {/* Type badge */}
                    <Badge variant="outline" className="absolute top-2 right-2 bg-background/80">
                      {product.type === "product" ? (
                        <><Package className="w-3 h-3 mr-1" />Produit</>
                      ) : (
                        <><Briefcase className="w-3 h-3 mr-1" />Service</>
                      )}
                    </Badge>

                    {/* Regulated */}
                    {product.produitReglemente && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "absolute bottom-2 left-2",
                          product.statutReglementaire === "approved" && "border-green-500 text-green-600",
                          product.statutReglementaire === "pending" && "border-amber-500 text-amber-600",
                          product.statutReglementaire === "rejected" && "border-red-500 text-red-600"
                        )}
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {product.statutReglementaire === "approved" && "Conforme"}
                        {product.statutReglementaire === "pending" && "En attente"}
                        {product.statutReglementaire === "rejected" && "Non conforme"}
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-1">{product.nom}</h3>
                      <p className="text-sm text-muted-foreground">{product.categorie} • {product.sousCategorie}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary">{product.prix.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-1">FCFA/{product.unite}</span>
                      </div>
                      {product.stock !== null && (
                        <Badge variant={product.stock <= 10 ? "destructive" : "outline"}>
                          Stock: {product.stock}
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {product.vues}
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4" />
                        {product.commandes}
                      </div>
                      <div className="flex items-center gap-1 ml-auto text-green-600 font-medium">
                        <TrendingUp className="w-4 h-4" />
                        {(product.chiffreAffaires / 1000).toFixed(0)}K
                      </div>
                    </div>

                    {/* Rejection reason */}
                    {product.status === "Rejected" && product.motifRejet && (
                      <div className="p-2 rounded bg-destructive/10 text-xs text-destructive">
                        <strong>Motif:</strong> {product.motifRejet}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowDetailDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pencil className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Dupliquer
                          </DropdownMenuItem>
                          
                          {product.status === "Published" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(product.id, "Paused")}>
                              <Ban className="w-4 h-4 mr-2" />
                              Mettre en pause
                            </DropdownMenuItem>
                          )}
                          
                          {product.status === "Paused" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(product.id, "Published")}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Réactiver
                            </DropdownMenuItem>
                          )}
                          
                          {product.status === "Draft" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(product.id, "InModeration")}>
                              <Upload className="w-4 h-4 mr-2" />
                              Soumettre
                            </DropdownMenuItem>
                          )}
                          
                          {["Rejected", "NeedsChanges"].includes(product.status) && (
                            <DropdownMenuItem>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Resoumettre
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => handleStatusChange(product.id, "Archived")}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archiver
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selectedProduct.image}</span>
                  {selectedProduct.nom}
                </DialogTitle>
                <DialogDescription>
                  {selectedProduct.categorie} • {selectedProduct.sousCategorie}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <Badge className={cn(statusConfig[selectedProduct.status].bgColor, statusConfig[selectedProduct.status].color)}>
                    {statusConfig[selectedProduct.status].label}
                  </Badge>
                  {selectedProduct.madeInCI && (
                    <Badge className={madeInCIBadges[selectedProduct.madeInCI].color}>
                      {madeInCIBadges[selectedProduct.madeInCI].label}
                    </Badge>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{selectedProduct.vues.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Vues</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{selectedProduct.commandes}</p>
                    <p className="text-xs text-muted-foreground">Commandes</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{(selectedProduct.chiffreAffaires / 1000000).toFixed(2)}M</p>
                    <p className="text-xs text-muted-foreground">CA (FCFA)</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{selectedProduct.stock ?? "∞"}</p>
                    <p className="text-xs text-muted-foreground">Stock</p>
                  </div>
                </div>

                {/* Price */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-3xl font-bold text-primary">
                    {selectedProduct.prix.toLocaleString()} FCFA
                    <span className="text-lg font-normal text-muted-foreground">/{selectedProduct.unite}</span>
                  </p>
                </div>

                {/* Dates */}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <p>Créé le: {selectedProduct.createdAt}</p>
                  <p>Modifié le: {selectedProduct.updatedAt}</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Fermer
                </Button>
                <Button>
                  <Pencil className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Supprimer le produit
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{selectedProduct?.nom}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedProduct && handleDelete(selectedProduct.id)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
