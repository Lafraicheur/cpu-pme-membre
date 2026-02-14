import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Trash2,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileCheck,
  Award,
  Star,
  Lock,
  Unlock,
  ShoppingCart,
  Briefcase,
  Wallet,
  ChevronRight,
  Calendar,
  RefreshCw,
  X,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types KYC
type KYCLevel = "minimum" | "standard" | "renforce";
type DocumentStatus = "pending" | "uploaded" | "verified" | "rejected" | "expired";

interface KYCDocument {
  id: string;
  name: string;
  description: string;
  level: KYCLevel;
  required: boolean;
  status: DocumentStatus;
  fileName?: string;
  uploadDate?: string;
  expirationDate?: string;
  rejectionReason?: string;
}

// Configuration des niveaux KYC
const kycLevels = {
  minimum: {
    label: "KYC Minimum",
    description: "Activation de l'entreprise",
    color: "bg-blue-500",
    unlocks: ["Profil entreprise", "Formation", "Consultation AO/Marketplace (lecture)"],
    icon: Unlock,
  },
  standard: {
    label: "KYC Standard",
    description: "AO + Marketplace vendeur",
    color: "bg-amber-500",
    unlocks: ["Soumission AO", "Publier annonces marketplace", "Participer aux programmes"],
    icon: Shield,
  },
  renforce: {
    label: "KYC Renforcé",
    description: "Financement / Gros marchés",
    color: "bg-emerald-500",
    unlocks: ["Accès financement", "Badge 'Entreprise vérifiée'", "Accès prioritaire"],
    icon: Award,
  },
};

// Documents requis par niveau
const initialDocuments: KYCDocument[] = [
  // KYC Minimum
  { id: "rccm", name: "RCCM", description: "Registre du Commerce et du Crédit Mobilier", level: "minimum", required: true, status: "verified", uploadDate: "2024-01-10" },
  { id: "idu", name: "IDU / Numéro fiscal", description: "Identifiant Unique si applicable", level: "minimum", required: true, status: "verified", uploadDate: "2024-01-10" },
  { id: "id_representant", name: "Pièce d'identité du représentant", description: "CNI, passeport ou carte consulaire", level: "minimum", required: true, status: "verified", uploadDate: "2024-01-10" },
  { id: "adresse", name: "Justificatif d'adresse siège", description: "Facture utilité, bail ou attestation", level: "minimum", required: true, status: "verified", uploadDate: "2024-01-10" },
  { id: "contact", name: "Téléphone & email vérifiés", description: "Coordonnées de l'entreprise validées", level: "minimum", required: true, status: "verified", uploadDate: "2024-01-10" },
  
  // KYC Standard
  { id: "attestation_fiscale", name: "Attestation de régularité fiscale", description: "ARF si disponible", level: "standard", required: false, status: "uploaded", uploadDate: "2024-01-15" },
  { id: "rib", name: "RIB / Mobile Money entreprise", description: "Coordonnées bancaires de l'entreprise", level: "standard", required: true, status: "verified", uploadDate: "2024-01-12" },
  { id: "statuts", name: "Statuts de l'entreprise", description: "Document de constitution", level: "standard", required: true, status: "uploaded", uploadDate: "2024-01-14" },
  { id: "preuve_activite", name: "Preuve d'activité", description: "Site web, factures, photos atelier, références", level: "standard", required: true, status: "pending" },
  { id: "ubo", name: "Bénéficiaire effectif (UBO)", description: "Nom(s) et % de détention", level: "standard", required: true, status: "pending" },
  
  // KYC Renforcé
  { id: "etats_financiers", name: "États financiers", description: "Ou déclaration CA simplifiée", level: "renforce", required: true, status: "pending" },
  { id: "cnps", name: "Attestation CNPS / Effectifs", description: "Si applicable", level: "renforce", required: false, status: "pending" },
  { id: "certifications", name: "Certifications", description: "Qualité, sanitaire, bio, etc.", level: "renforce", required: false, status: "pending", expirationDate: "2025-12-31" },
  { id: "assurance", name: "Assurance responsabilité", description: "Si secteur à risque", level: "renforce", required: false, status: "pending" },
  { id: "visite", name: "Visite / Contrôle sur site", description: "Validation 'Entreprise vérifiée'", level: "renforce", required: false, status: "pending" },
];

const statusConfig: Record<DocumentStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "En attente", color: "bg-muted text-muted-foreground", icon: Clock },
  uploaded: { label: "Téléchargé", color: "bg-blue-500/10 text-blue-500", icon: Upload },
  verified: { label: "Validé", color: "bg-success/10 text-success", icon: CheckCircle2 },
  rejected: { label: "Rejeté", color: "bg-destructive/10 text-destructive", icon: X },
  expired: { label: "Expiré", color: "bg-warning/10 text-warning", icon: AlertCircle },
};

export default function KYCConformite() {
  const [documents, setDocuments] = useState<KYCDocument[]>(initialDocuments);
  const [activeLevel, setActiveLevel] = useState<KYCLevel>("standard");
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  const { toast } = useToast();

  // Calcul du statut par niveau
  const getLevelStatus = (level: KYCLevel) => {
    const levelDocs = documents.filter((d) => d.level === level);
    const requiredDocs = levelDocs.filter((d) => d.required);
    const verifiedRequired = requiredDocs.filter((d) => d.status === "verified");
    
    const percentage = requiredDocs.length > 0 
      ? Math.round((verifiedRequired.length / requiredDocs.length) * 100)
      : 0;
    
    const isComplete = verifiedRequired.length === requiredDocs.length && requiredDocs.length > 0;
    
    return { percentage, isComplete, total: requiredDocs.length, verified: verifiedRequired.length };
  };

  const minimumStatus = getLevelStatus("minimum");
  const standardStatus = getLevelStatus("standard");
  const renforceStatus = getLevelStatus("renforce");

  const overallStatus = {
    minimum: minimumStatus.isComplete,
    standard: minimumStatus.isComplete && standardStatus.isComplete,
    renforce: minimumStatus.isComplete && standardStatus.isComplete && renforceStatus.isComplete,
  };

  const handleUpload = (docId: string) => {
    setDocuments((docs) =>
      docs.map((d) =>
        d.id === docId
          ? { ...d, status: "uploaded" as DocumentStatus, fileName: `doc_${docId}.pdf`, uploadDate: new Date().toISOString().split("T")[0] }
          : d
      )
    );
    toast({
      title: "Document téléchargé",
      description: "Votre document est en cours de vérification.",
    });
  };

  const handleDelete = (docId: string) => {
    setDocuments((docs) =>
      docs.map((d) =>
        d.id === docId
          ? { ...d, status: "pending" as DocumentStatus, fileName: undefined, uploadDate: undefined }
          : d
      )
    );
  };

  const getDocumentsByLevel = (level: KYCLevel) => {
    return documents.filter((d) => d.level === level);
  };

  const renderDocumentCard = (doc: KYCDocument) => {
    const status = statusConfig[doc.status];
    const StatusIcon = status.icon;

    return (
      <div
        key={doc.id}
        className={`p-4 rounded-lg border transition-all ${
          doc.status === "verified"
            ? "border-success/50 bg-success/5"
            : doc.status === "rejected"
            ? "border-destructive/50 bg-destructive/5"
            : doc.status === "uploaded"
            ? "border-blue-500/50 bg-blue-500/5"
            : doc.required
            ? "border-warning/50 bg-warning/5"
            : "border-border"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${status.color}`}>
              <StatusIcon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{doc.name}</p>
                {doc.required && (
                  <Badge variant="outline" className="text-xs">Obligatoire</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{doc.description}</p>
              
              {doc.fileName && (
                <p className="text-xs text-muted-foreground mt-2">
                  📎 {doc.fileName} • Téléchargé le {doc.uploadDate}
                </p>
              )}
              
              {doc.expirationDate && (
                <p className="text-xs text-warning mt-1">
                  ⏰ Expire le {doc.expirationDate}
                </p>
              )}
              
              {doc.status === "rejected" && doc.rejectionReason && (
                <p className="text-xs text-destructive mt-1">
                  ❌ {doc.rejectionReason}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={status.color}>{status.label}</Badge>
            
            {doc.status === "pending" && (
              <Button size="sm" onClick={() => handleUpload(doc.id)}>
                <Upload className="h-4 w-4 mr-1" />
                Télécharger
              </Button>
            )}
            
            {doc.status === "uploaded" && (
              <>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {doc.status === "verified" && (
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            {(doc.status === "rejected" || doc.status === "expired") && (
              <Button size="sm" variant="outline" onClick={() => handleUpload(doc.id)}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Renvoyer
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              KYC & Conformité
            </h1>
            <p className="text-muted-foreground">
              Complétez votre dossier pour débloquer toutes les fonctionnalités
            </p>
          </div>
        </div>

        {/* Niveau KYC Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {(Object.entries(kycLevels) as [KYCLevel, typeof kycLevels.minimum][]).map(([level, config]) => {
            const status = getLevelStatus(level);
            const isUnlocked = overallStatus[level];
            const LevelIcon = config.icon;

            return (
              <Card
                key={level}
                className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  activeLevel === level ? "ring-2 ring-primary" : ""
                } ${isUnlocked ? "border-success/50" : ""}`}
                onClick={() => setActiveLevel(level)}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${config.color}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${isUnlocked ? "bg-success/10" : "bg-muted"}`}>
                        {isUnlocked ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <LevelIcon className={`h-5 w-5 ${activeLevel === level ? "text-primary" : "text-muted-foreground"}`} />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base">{config.label}</CardTitle>
                        <CardDescription className="text-xs">{config.description}</CardDescription>
                      </div>
                    </div>
                    {isUnlocked && (
                      <Badge className="bg-success/10 text-success">Validé</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">{status.verified}/{status.total} obligatoires</span>
                    </div>
                    <Progress value={status.percentage} className="h-2" />
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Débloque :</p>
                      <div className="space-y-1">
                        {config.unlocks.slice(0, 2).map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            {isUnlocked ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className={isUnlocked ? "" : "text-muted-foreground"}>{item}</span>
                          </div>
                        ))}
                        {config.unlocks.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{config.unlocks.length - 2} autres</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Statut global */}
        <Card className="border-border/50">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  {overallStatus.minimum ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={overallStatus.minimum ? "text-success font-medium" : "text-muted-foreground"}>
                    KYC Minimum
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  {overallStatus.standard ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={overallStatus.standard ? "text-success font-medium" : "text-muted-foreground"}>
                    KYC Standard
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  {overallStatus.renforce ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={overallStatus.renforce ? "text-success font-medium" : "text-muted-foreground"}>
                    KYC Renforcé
                  </span>
                </div>
              </div>
              
              {overallStatus.renforce && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  <Award className="h-4 w-4 mr-1" />
                  Entreprise Vérifiée
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents par niveau */}
        <Tabs value={activeLevel} onValueChange={(v) => setActiveLevel(v as KYCLevel)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="minimum" className="gap-2">
              <Unlock className="h-4 w-4" />
              <span className="hidden sm:inline">Minimum</span>
              {minimumStatus.isComplete && <CheckCircle2 className="h-4 w-4 text-success" />}
            </TabsTrigger>
            <TabsTrigger value="standard" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Standard</span>
              {standardStatus.isComplete && <CheckCircle2 className="h-4 w-4 text-success" />}
            </TabsTrigger>
            <TabsTrigger value="renforce" className="gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Renforcé</span>
              {renforceStatus.isComplete && <CheckCircle2 className="h-4 w-4 text-success" />}
            </TabsTrigger>
          </TabsList>

          {(["minimum", "standard", "renforce"] as KYCLevel[]).map((level) => {
            const levelConfig = kycLevels[level];
            const status = getLevelStatus(level);
            const levelDocs = getDocumentsByLevel(level);

            return (
              <TabsContent key={level} value={level} className="space-y-6">
                {/* Level Header */}
                <Card className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${levelConfig.color}/20`}>
                          <levelConfig.icon className={`h-6 w-6 ${levelConfig.color.replace("bg-", "text-")}`} />
                        </div>
                        <div>
                          <CardTitle>{levelConfig.label}</CardTitle>
                          <CardDescription>{levelConfig.description}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{status.percentage}%</p>
                        <p className="text-sm text-muted-foreground">
                          {status.verified}/{status.total} validés
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {levelConfig.unlocks.map((item, i) => (
                        <Badge key={i} variant="outline" className="gap-1">
                          {status.isComplete ? (
                            <Unlock className="h-3 w-3 text-success" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Documents requis</h3>
                  {levelDocs.map(renderDocumentCard)}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Actions d'aide */}
        <Card className="border-border/50">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Besoin d'aide pour compléter votre KYC ?</h3>
                <p className="text-sm text-muted-foreground">
                  Notre équipe est disponible pour vous accompagner dans la constitution de votre dossier.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Guide KYC
                </Button>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Contacter le support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
