import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye,
  Download,
  Search,
  AlertCircle,
  FileCheck,
  Calendar,
  Building2,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ComplianceStatus = "pending" | "approved" | "rejected" | "expired" | "incomplete";

interface RegulatedProduct {
  id: string;
  nom: string;
  categorie: string;
  typeReglementation: string;
  status: ComplianceStatus;
  documents: ComplianceDocument[];
  dateExpiration: string | null;
  dernierAudit: string | null;
  commentaireAdmin: string | null;
  image: string;
}

interface ComplianceDocument {
  id: string;
  type: string;
  nom: string;
  fichier: string | null;
  status: "pending" | "approved" | "rejected" | "missing";
  dateUpload: string | null;
  dateExpiration: string | null;
  commentaire: string | null;
}

const regulationTypes = [
  { id: "alimentaire", label: "Sécurité alimentaire", icon: "🍽️", documents: ["Certificat sanitaire", "Analyse microbiologique", "Traçabilité origine"] },
  { id: "phytosanitaire", label: "Produits phytosanitaires", icon: "🌿", documents: ["Autorisation de mise sur le marché", "Fiche de données sécurité", "Certificat de conformité"] },
  { id: "cosmetique", label: "Cosmétiques", icon: "💄", documents: ["Notification DGAMP", "Test dermatologique", "Liste INCI", "Étiquetage conforme"] },
  { id: "pharmaceutique", label: "Produits parapharmaceutiques", icon: "💊", documents: ["Autorisation de vente", "Notice", "Certificat de conformité"] },
  { id: "chimique", label: "Produits chimiques", icon: "🧪", documents: ["Fiche de données sécurité", "Étiquetage CLP", "Autorisation transport"] },
  { id: "electronique", label: "Électronique/Électrique", icon: "⚡", documents: ["Certificat CE", "Déclaration de conformité", "Test de sécurité"] },
];

const statusConfig: Record<ComplianceStatus, { label: string; color: string; icon: typeof CheckCircle2; bgColor: string }> = {
  pending: { label: "En attente", color: "text-amber-500", icon: Clock, bgColor: "bg-amber-500/10" },
  approved: { label: "Conforme", color: "text-green-500", icon: CheckCircle2, bgColor: "bg-green-500/10" },
  rejected: { label: "Non conforme", color: "text-destructive", icon: XCircle, bgColor: "bg-destructive/10" },
  expired: { label: "Expiré", color: "text-orange-500", icon: AlertCircle, bgColor: "bg-orange-500/10" },
  incomplete: { label: "Incomplet", color: "text-muted-foreground", icon: AlertTriangle, bgColor: "bg-muted" },
};

const mockProducts: RegulatedProduct[] = [
  {
    id: "1",
    nom: "Huile de palme raffinée - 20L",
    categorie: "Agro-industrie",
    typeReglementation: "alimentaire",
    status: "approved",
    documents: [
      { id: "d1", type: "Certificat sanitaire", nom: "cert_sanitaire_2024.pdf", fichier: "url", status: "approved", dateUpload: "2024-01-15", dateExpiration: "2025-01-15", commentaire: null },
      { id: "d2", type: "Analyse microbiologique", nom: "analyse_micro.pdf", fichier: "url", status: "approved", dateUpload: "2024-01-10", dateExpiration: "2024-07-10", commentaire: null },
      { id: "d3", type: "Traçabilité origine", nom: "tracabilite.pdf", fichier: "url", status: "approved", dateUpload: "2024-01-15", dateExpiration: null, commentaire: null },
    ],
    dateExpiration: "2024-07-10",
    dernierAudit: "2024-01-15",
    commentaireAdmin: null,
    image: "🫒",
  },
  {
    id: "2",
    nom: "Crème hydratante karité",
    categorie: "Cosmétique",
    typeReglementation: "cosmetique",
    status: "pending",
    documents: [
      { id: "d4", type: "Notification DGAMP", nom: "notification.pdf", fichier: "url", status: "approved", dateUpload: "2024-03-01", dateExpiration: null, commentaire: null },
      { id: "d5", type: "Test dermatologique", nom: "", fichier: null, status: "missing", dateUpload: null, dateExpiration: null, commentaire: null },
      { id: "d6", type: "Liste INCI", nom: "inci.pdf", fichier: "url", status: "pending", dateUpload: "2024-03-10", dateExpiration: null, commentaire: null },
      { id: "d7", type: "Étiquetage conforme", nom: "", fichier: null, status: "missing", dateUpload: null, dateExpiration: null, commentaire: null },
    ],
    dateExpiration: null,
    dernierAudit: null,
    commentaireAdmin: "Documents en cours de vérification. Veuillez fournir le test dermatologique.",
    image: "🧴",
  },
  {
    id: "3",
    nom: "Insecticide agricole bio",
    categorie: "Agriculture",
    typeReglementation: "phytosanitaire",
    status: "rejected",
    documents: [
      { id: "d8", type: "Autorisation de mise sur le marché", nom: "amm.pdf", fichier: "url", status: "rejected", dateUpload: "2024-02-20", dateExpiration: null, commentaire: "Document périmé - renouvellement requis" },
      { id: "d9", type: "Fiche de données sécurité", nom: "fds.pdf", fichier: "url", status: "approved", dateUpload: "2024-02-20", dateExpiration: "2025-02-20", commentaire: null },
      { id: "d10", type: "Certificat de conformité", nom: "", fichier: null, status: "missing", dateUpload: null, dateExpiration: null, commentaire: null },
    ],
    dateExpiration: null,
    dernierAudit: "2024-02-25",
    commentaireAdmin: "L'autorisation de mise sur le marché n'est plus valide. Veuillez fournir un document renouvelé.",
    image: "🧪",
  },
];

export function ProduitsReglementes() {
  const [products, setProducts] = useState<RegulatedProduct[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<RegulatedProduct | null>(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<ComplianceDocument | null>(null);

  const stats = {
    total: products.length,
    approved: products.filter(p => p.status === "approved").length,
    pending: products.filter(p => p.status === "pending").length,
    rejected: products.filter(p => p.status === "rejected").length,
    expiringSoon: products.filter(p => {
      if (!p.dateExpiration) return false;
      const expDate = new Date(p.dateExpiration);
      const today = new Date();
      const diff = (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30 && diff > 0;
    }).length,
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getDocumentProgress = (product: RegulatedProduct) => {
    const approved = product.documents.filter(d => d.status === "approved").length;
    return (approved / product.documents.length) * 100;
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
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.approved}</p>
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
                <p className="text-2xl font-bold">{stats.pending}</p>
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
                <p className="text-2xl font-bold">{stats.rejected}</p>
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
                <p className="text-2xl font-bold">{stats.expiringSoon}</p>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const status = statusConfig[product.status];
          const StatusIcon = status.icon;
          const progress = getDocumentProgress(product);
          const regulation = regulationTypes.find(r => r.id === product.typeReglementation);

          return (
            <Card key={product.id} className="hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-6 flex items-center justify-center h-24 rounded-t-lg">
                  <span className="text-4xl">{product.image}</span>
                  <Badge className={cn("absolute top-2 left-2", status.bgColor, status.color, "border-0")}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                  <Badge variant="outline" className="absolute top-2 right-2 bg-background/80">
                    {regulation?.icon} {regulation?.label}
                  </Badge>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold">{product.nom}</h3>
                    <p className="text-sm text-muted-foreground">{product.categorie}</p>
                  </div>

                  {/* Progress documents */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Documents validés</span>
                      <span className="font-medium">
                        {product.documents.filter(d => d.status === "approved").length}/{product.documents.length}
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

                  {/* Commentaire admin */}
                  {product.commentaireAdmin && (
                    <div className="p-3 rounded-lg bg-muted text-sm">
                      <p className="text-muted-foreground">{product.commentaireAdmin}</p>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowDocumentDialog(true);
                    }}
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
                      {regulationTypes.find(r => r.id === selectedProduct.typeReglementation)?.icon}
                    </span>
                    <div>
                      <p className="font-medium">
                        {regulationTypes.find(r => r.id === selectedProduct.typeReglementation)?.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedProduct.documents.length} documents requis
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liste documents */}
              <div className="space-y-3">
                {selectedProduct.documents.map((doc) => {
                  const docStatus = {
                    pending: { label: "En vérification", color: "text-amber-500", bgColor: "bg-amber-500/10" },
                    approved: { label: "Validé", color: "text-green-500", bgColor: "bg-green-500/10" },
                    rejected: { label: "Refusé", color: "text-destructive", bgColor: "bg-destructive/10" },
                    missing: { label: "Manquant", color: "text-muted-foreground", bgColor: "bg-muted" },
                  }[doc.status];

                  return (
                    <Card key={doc.id} className={cn(
                      "border",
                      doc.status === "rejected" && "border-destructive/30",
                      doc.status === "missing" && "border-dashed"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", docStatus.bgColor)}>
                              <FileText className={cn("w-4 h-4", docStatus.color)} />
                            </div>
                            <div>
                              <p className="font-medium">{doc.type}</p>
                              {doc.nom && (
                                <p className="text-sm text-muted-foreground">{doc.nom}</p>
                              )}
                              {doc.dateExpiration && (
                                <p className="text-xs text-muted-foreground">
                                  Expire le {new Date(doc.dateExpiration).toLocaleDateString('fr-FR')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn(docStatus.bgColor, docStatus.color, "border-0")}>
                              {docStatus.label}
                            </Badge>
                            {doc.fichier ? (
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setUploadingDoc(doc)}
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Uploader
                              </Button>
                            )}
                          </div>
                        </div>
                        {doc.commentaire && (
                          <div className="mt-3 p-2 rounded bg-destructive/10 text-sm text-destructive">
                            {doc.commentaire}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
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
      <Dialog open={!!uploadingDoc} onOpenChange={() => setUploadingDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uploader un document</DialogTitle>
            <DialogDescription>
              {uploadingDoc?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">
                Cliquez ou glissez votre fichier ici
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG (max 10 Mo)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Date d'expiration (si applicable)</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Commentaire (optionnel)</Label>
              <Textarea placeholder="Informations complémentaires..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadingDoc(null)}>
              Annuler
            </Button>
            <Button onClick={() => setUploadingDoc(null)}>
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}