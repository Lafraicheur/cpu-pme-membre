import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Shield,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  AlertCircle,
  FileCheck,
  Calendar,
  Package,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  regulatedProductsApi,
  productsApi,
  boutiquesApi,
  type RegulatedProductsStats,
  type RegulatedProductApi,
  type RegulatedProductDocumentApi,
  type Product as ApiProduct,
} from "@/lib/api";

type ComplianceStatus = "pending" | "approved" | "rejected" | "expired" | "incomplete";

interface RegulatedProduct {
  id: string;
  nom: string;
  categorie: string;
  sousCategorie: string;
  typeReglementation: string;
  typeReglementationLabel: string;
  status: ComplianceStatus;
  documentsValidated: number;
  documentsRequired: number;
  missingDocuments: string[];
  dateExpiration: string | null;
  alertMessage: string | null;
  image: string;
}

const REGULATION_TYPES: { value: string; label: string; icon: string }[] = [
  { value: "securite_alimentaire", label: "Sécurité alimentaire", icon: "🍽️" },
  { value: "cosmetiques", label: "Cosmétiques", icon: "💄" },
  { value: "phytosanitaires", label: "Phytosanitaires", icon: "🌿" },
];

const COMPLIANCE_STATUS_MAP: Record<string, ComplianceStatus> = {
  conforme: "approved",
  en_attente: "pending",
  non_conforme: "rejected",
  expire: "expired",
  expiree: "expired",
  incomplet: "incomplete",
};

const statusConfig: Record<ComplianceStatus, { label: string; color: string; icon: typeof CheckCircle2; bgColor: string }> = {
  pending: { label: "En attente", color: "text-amber-500", icon: Clock, bgColor: "bg-amber-500/10" },
  approved: { label: "Conforme", color: "text-green-500", icon: CheckCircle2, bgColor: "bg-green-500/10" },
  rejected: { label: "Non conforme", color: "text-destructive", icon: XCircle, bgColor: "bg-destructive/10" },
  expired: { label: "Expiré", color: "text-orange-500", icon: AlertCircle, bgColor: "bg-orange-500/10" },
  incomplete: { label: "Incomplet", color: "text-muted-foreground", icon: AlertTriangle, bgColor: "bg-muted" },
};

const DOC_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  missing: { label: "Manquant", color: "text-muted-foreground", bgColor: "bg-muted" },
  pending: { label: "En vérification", color: "text-amber-500", bgColor: "bg-amber-500/10" },
  approved: { label: "Validé", color: "text-green-500", bgColor: "bg-green-500/10" },
  rejected: { label: "Refusé", color: "text-destructive", bgColor: "bg-destructive/10" },
  expired: { label: "Expiré", color: "text-orange-500", bgColor: "bg-orange-500/10" },
};

function getDocStatusConfig(doc: RegulatedProductDocumentApi) {
  const key = (doc.status ?? "").toLowerCase();
  return DOC_STATUS_CONFIG[key] ?? (doc.fileUrl
    ? { label: "En vérification", color: "text-amber-500", bgColor: "bg-amber-500/10" }
    : { label: "Manquant", color: "text-muted-foreground", bgColor: "bg-muted" });
}

function parseMissingDocuments(alertMessage?: string | null): string[] {
  if (!alertMessage) return [];
  return alertMessage
    .split(/(?<=\.)\s+/)
    .map((s) => s.replace(/^Veuillez fournir\s*:\s*/i, "").replace(/\.$/, "").trim())
    .filter(Boolean);
}

function mapApiRegulatedProduct(r: RegulatedProductApi): RegulatedProduct {
  return {
    id: r.id,
    nom: r.productName ?? "Produit",
    categorie: r.productCategory ?? "",
    sousCategorie: r.productSubCategory ?? "",
    typeReglementation: r.regulatedCategoryType ?? "",
    typeReglementationLabel: r.regulatedCategoryLabel ?? "",
    status: COMPLIANCE_STATUS_MAP[r.complianceStatus] ?? "incomplete",
    documentsValidated: r.documentsValidated ?? 0,
    documentsRequired: r.documentsRequired ?? 0,
    missingDocuments: parseMissingDocuments(r.alertMessage),
    dateExpiration: r.nearestExpiry ?? null,
    alertMessage: r.alertMessage ?? null,
    image: "🛡️",
  };
}

export function ProduitsReglementes() {
  const [products, setProducts] = useState<RegulatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<RegulatedProduct | null>(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [documents, setDocuments] = useState<RegulatedProductDocumentApi[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<RegulatedProductDocumentApi | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadExpiresAt, setUploadExpiresAt] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [apiStats, setApiStats] = useState<RegulatedProductsStats | null>(null);

  const fetchProducts = useCallback(() => {
    setIsLoading(true);
    setError(null);
    regulatedProductsApi.getAll({ status: statusFilter, q: searchQuery || undefined, page, limit: 20 })
      .then((res) => {
        setProducts(res.data.map(mapApiRegulatedProduct));
        setApiStats(res.stats);
        setTotalPages(res.totalPages || 1);
      })
      .catch(() => setError("Impossible de charger les produits réglementés."))
      .finally(() => setIsLoading(false));
  }, [statusFilter, searchQuery, page]);

  // Debounce : la recherche déclenche l'API après une pause de frappe
  useEffect(() => {
    const t = setTimeout(fetchProducts, 350);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const stats = {
    total: apiStats?.total ?? 0,
    approved: apiStats?.conforme ?? 0,
    pending: apiStats?.enAttente ?? 0,
    rejected: apiStats?.nonConforme ?? 0,
    expiringSoon: apiStats?.expirentBientot ?? 0,
  };

  const getDocumentProgress = (product: RegulatedProduct) => {
    if (product.documentsRequired === 0) return 0;
    return (product.documentsValidated / product.documentsRequired) * 100;
  };

  const fetchDocuments = (productId: string) => {
    setLoadingDocuments(true);
    regulatedProductsApi.getDocuments(productId)
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setLoadingDocuments(false));
  };

  const openDocumentDialog = (product: RegulatedProduct) => {
    setSelectedProduct(product);
    setShowDocumentDialog(true);
    setDocuments([]);
    fetchDocuments(product.id);
  };

  const openUploadDialog = (doc: RegulatedProductDocumentApi) => {
    setUploadingDoc(doc);
    setUploadFile(null);
    setUploadExpiresAt("");
  };

  const handleUpload = async () => {
    if (!uploadingDoc || !uploadFile) return;
    setIsUploading(true);
    try {
      await regulatedProductsApi.uploadDocument(uploadingDoc.id, uploadFile, uploadExpiresAt || undefined);
      toast.success("Document envoyé");
      setUploadingDoc(null);
      setUploadFile(null);
      setUploadExpiresAt("");
      if (selectedProduct) fetchDocuments(selectedProduct.id);
      fetchProducts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "L'envoi du document a échoué.");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Déclaration d'un nouveau produit réglementé ──────────────────────────
  const [showDeclareDialog, setShowDeclareDialog] = useState(false);
  const [boutiqueId, setBoutiqueId] = useState("");
  const [myProducts, setMyProducts] = useState<ApiProduct[]>([]);
  const [loadingMyProducts, setLoadingMyProducts] = useState(false);
  const [declareProductId, setDeclareProductId] = useState("");
  const [declareCategoryType, setDeclareCategoryType] = useState("");
  const [isDeclaring, setIsDeclaring] = useState(false);

  useEffect(() => {
    boutiquesApi.getMyShop().then((b) => setBoutiqueId(b?.id ?? "")).catch(() => {});
  }, []);

  const openDeclareDialog = () => {
    setDeclareProductId("");
    setDeclareCategoryType("");
    setShowDeclareDialog(true);
    if (boutiqueId) {
      setLoadingMyProducts(true);
      productsApi.getAll({ boutiqueId, limit: 100 })
        .then((page) => setMyProducts(page.data ?? []))
        .catch(() => setMyProducts([]))
        .finally(() => setLoadingMyProducts(false));
    }
  };

  const handleDeclare = async () => {
    if (!declareProductId) return;
    setIsDeclaring(true);
    try {
      await regulatedProductsApi.create({
        productId: declareProductId,
        categoryType: declareCategoryType || undefined,
      });
      toast.success("Produit déclaré réglementé", { description: "Les documents requis ont été créés." });
      setShowDeclareDialog(false);
      fetchProducts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "La déclaration a échoué.");
    } finally {
      setIsDeclaring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Produits Réglementés
          </h2>
          <p className="text-sm text-muted-foreground">
            Gestion de la conformité et des documents réglementaires
          </p>
        </div>
        <Button onClick={openDeclareDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Déclarer un produit réglementé
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "…" : stats.total}</p>
                <p className="text-xs text-muted-foreground">Produits réglementés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "…" : stats.approved}</p>
                <p className="text-xs text-muted-foreground">Conformes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "…" : stats.pending}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "…" : stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Non conformes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.expiringSoon > 0 ? "border-orange-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "…" : stats.expiringSoon}</p>
                <p className="text-xs text-muted-foreground">Expirent bientôt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerte expirations */}
      {stats.expiringSoon > 0 && (
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium">{stats.expiringSoon} document(s) expirent dans les 30 prochains jours</p>
                <p className="text-sm text-muted-foreground">
                  Pensez à renouveler vos certifications pour maintenir la conformité
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Statut conformité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="approved">Conformes</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="rejected">Non conformes</SelectItem>
                <SelectItem value="expired">Expirés</SelectItem>
                <SelectItem value="incomplete">Incomplets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Chargement...</span>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive opacity-70" />
            <h3 className="font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={fetchProducts}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">Aucun produit réglementé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Déclarez un produit soumis à réglementation pour suivre sa conformité.
            </p>
            <Button onClick={openDeclareDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Déclarer un produit réglementé
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const status = statusConfig[product.status];
            const StatusIcon = status.icon;
            const progress = getDocumentProgress(product);
            const regulation = REGULATION_TYPES.find(rt => rt.value === product.typeReglementation);

            return (
              <Card key={product.id} className="hover:shadow-md transition-all">
                <CardContent className="p-0">
                  <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-6 flex items-center justify-center h-24 rounded-t-lg">
                    <span className="text-4xl">{regulation?.icon ?? product.image}</span>
                    <Badge className={cn("absolute top-2 left-2", status.bgColor, status.color, "border-0")}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                    <Badge variant="outline" className="absolute top-2 right-2 bg-background/80">
                      {product.typeReglementationLabel || regulation?.label || product.typeReglementation}
                    </Badge>
                  </div>

                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="font-semibold">{product.nom}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.categorie}{product.sousCategorie ? ` • ${product.sousCategorie}` : ""}
                      </p>
                    </div>

                    {/* Progress documents */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Documents validés</span>
                        <span className="font-medium">
                          {product.documentsValidated}/{product.documentsRequired}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Date expiration */}
                    {product.dateExpiration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Expire le:</span>
                        <span className={cn(
                          "font-medium",
                          new Date(product.dateExpiration) < new Date() && "text-destructive",
                          new Date(product.dateExpiration) > new Date() && new Date(product.dateExpiration) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && "text-orange-500"
                        )}>
                          {new Date(product.dateExpiration).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}

                    {/* Alerte */}
                    {product.alertMessage && (
                      <div className="p-3 rounded-lg bg-muted text-sm">
                        <p className="text-muted-foreground">{product.alertMessage}</p>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => openDocumentDialog(product)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Gérer les documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Suivant <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Dialog déclaration d'un produit réglementé */}
      <Dialog open={showDeclareDialog} onOpenChange={setShowDeclareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Déclarer un produit réglementé
            </DialogTitle>
            <DialogDescription>
              Sélectionnez un produit existant et son type de réglementation. Les documents requis seront créés automatiquement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Produit *</Label>
              <Select value={declareProductId} onValueChange={setDeclareProductId} disabled={loadingMyProducts}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingMyProducts ? "Chargement..." : "Choisir un produit"} />
                </SelectTrigger>
                <SelectContent>
                  {myProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type de réglementation</Label>
              <Select value={declareCategoryType} onValueChange={setDeclareCategoryType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  {REGULATION_TYPES.map((rt) => (
                    <SelectItem key={rt.value} value={rt.value}>{rt.icon} {rt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclareDialog(false)}>
              Annuler
            </Button>
            <Button disabled={!declareProductId || isDeclaring} onClick={handleDeclare}>
              {isDeclaring ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
              Déclarer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog gestion documents */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Documents de conformité - {selectedProduct?.nom}
            </DialogTitle>
            <DialogDescription>
              Gérez les documents réglementaires requis pour ce produit
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 py-4">
              {/* Info réglementation */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {REGULATION_TYPES.find(rt => rt.value === selectedProduct.typeReglementation)?.icon}
                    </span>
                    <div>
                      <p className="font-medium">
                        {selectedProduct.typeReglementationLabel || selectedProduct.typeReglementation}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedProduct.documentsValidated}/{selectedProduct.documentsRequired} documents validés
                      </p>
                    </div>
                  </div>
                  <Progress value={getDocumentProgress(selectedProduct)} className="h-2 mt-3" />
                </CardContent>
              </Card>

              {/* Liste des documents */}
              {loadingDocuments ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Chargement des documents...</span>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => {
                    const docStatus = getDocStatusConfig(doc);
                    const label = doc.name ?? "Document";
                    return (
                      <Card key={doc.id} className={cn("border", !doc.fileUrl && "border-dashed")}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg", docStatus.bgColor)}>
                                <FileText className={cn("w-4 h-4", docStatus.color)} />
                              </div>
                              <div>
                                <p className="font-medium">{label}</p>
                                {doc.expiresAt && (
                                  <p className="text-xs text-muted-foreground">
                                    Expire le {new Date(doc.expiresAt).toLocaleDateString('fr-FR')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={cn(docStatus.bgColor, docStatus.color, "border-0")}>
                                {docStatus.label}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openUploadDialog(doc)}
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                {doc.fileUrl ? "Remplacer" : "Uploader"}
                              </Button>
                            </div>
                          </div>
                          {doc.rejectionReason && (
                            <div className="mt-3 p-2 rounded bg-destructive/10 text-sm text-destructive">
                              {doc.rejectionReason}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted text-sm text-muted-foreground">
                  Aucun document trouvé pour ce produit.
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog upload document */}
      <Dialog open={!!uploadingDoc} onOpenChange={(open) => { if (!open) setUploadingDoc(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uploader un document</DialogTitle>
            <DialogDescription>
              {uploadingDoc?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input
              id="regulated-doc-file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
            <label
              htmlFor="regulated-doc-file-input"
              className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              {uploadFile ? (
                <p className="text-sm font-medium mt-2">{uploadFile.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Cliquez pour choisir votre fichier
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG (max 10 Mo)
              </p>
            </label>
            {uploadingDoc?.hasExpiry && (
              <div className="space-y-2">
                <Label>Date d'expiration</Label>
                <Input type="date" value={uploadExpiresAt} onChange={(e) => setUploadExpiresAt(e.target.value)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={isUploading} onClick={() => setUploadingDoc(null)}>
              Annuler
            </Button>
            <Button disabled={!uploadFile || isUploading} onClick={handleUpload}>
              {isUploading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
