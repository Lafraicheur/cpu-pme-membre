import { useState } from "react";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Calendar,
  BarChart3,
  ShoppingCart,
  GraduationCap,
  Wallet,
  FileCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportsLibraryProps {
  onBack: () => void;
  onGenerateReport: () => void;
  canExport: boolean;
}

type ReportStatus = "available" | "queued" | "generating" | "ready" | "failed" | "expired";

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  lastGenerated?: string;
  status: ReportStatus;
  formats: string[];
  premium?: boolean;
}

const reportTemplates: Report[] = [
  {
    id: "monthly",
    name: "Rapport mensuel entreprise",
    description: "Vue d'ensemble de toutes vos activités sur le mois",
    category: "general",
    icon: BarChart3,
    lastGenerated: "15 déc. 2024",
    status: "available",
    formats: ["PDF"],
  },
  {
    id: "sales",
    name: "Ventes & commandes",
    description: "Détail des ventes, commandes et performance commerciale",
    category: "marketplace",
    icon: ShoppingCart,
    lastGenerated: "12 déc. 2024",
    status: "available",
    formats: ["PDF", "XLSX"],
  },
  {
    id: "ao-performance",
    name: "Performance Appels d'Offres",
    description: "Soumissions, taux de succès, montants gagnés/perdus",
    category: "ao",
    icon: FileCheck,
    status: "available",
    formats: ["PDF", "XLSX"],
  },
  {
    id: "formation",
    name: "Reporting Formation",
    description: "Heures suivies, complétion, certificats obtenus",
    category: "formation",
    icon: GraduationCap,
    lastGenerated: "1 déc. 2024",
    status: "available",
    formats: ["PDF"],
  },
  {
    id: "financement",
    name: "Pipeline Financement",
    description: "Dossiers en cours, statuts, délais de traitement",
    category: "financement",
    icon: Wallet,
    status: "available",
    formats: ["PDF", "XLSX"],
    premium: true,
  },
  {
    id: "events",
    name: "Participation Événements",
    description: "Inscriptions, RDV B2B, leads exposant",
    category: "evenements",
    icon: Calendar,
    status: "available",
    formats: ["PDF"],
  },
];

const recentReports = [
  { id: "1", name: "Rapport mensuel - Nov 2024", date: "30 nov. 2024", status: "ready" as ReportStatus, format: "PDF" },
  { id: "2", name: "Ventes Q3 2024", date: "15 oct. 2024", status: "ready" as ReportStatus, format: "XLSX" },
  { id: "3", name: "Performance AO 2024", date: "1 déc. 2024", status: "generating" as ReportStatus, format: "PDF" },
  { id: "4", name: "Formation équipe", date: "28 nov. 2024", status: "expired" as ReportStatus, format: "PDF" },
];

const statusConfig: Record<ReportStatus, { label: string; icon: React.ElementType; color: string }> = {
  available: { label: "Disponible", icon: FileText, color: "text-muted-foreground" },
  queued: { label: "En file", icon: Clock, color: "text-yellow-500" },
  generating: { label: "Génération...", icon: Loader2, color: "text-blue-500" },
  ready: { label: "Prêt", icon: CheckCircle2, color: "text-green-500" },
  failed: { label: "Échec", icon: AlertCircle, color: "text-red-500" },
  expired: { label: "Expiré", icon: Clock, color: "text-muted-foreground" },
};

export function ReportsLibrary({ onBack, onGenerateReport, canExport }: ReportsLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("templates");

  const filteredReports = reportTemplates.filter(
    (report) =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bibliothèque de rapports</h1>
            <p className="text-muted-foreground">Générez et téléchargez vos rapports</p>
          </div>
        </div>
        <Button onClick={onGenerateReport}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau rapport
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un rapport..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Modèles de rapports</TabsTrigger>
          <TabsTrigger value="recent">Rapports récents</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <report.icon className="h-5 w-5 text-primary" />
                    </div>
                    {report.premium && !canExport && (
                      <Badge variant="secondary">Premium</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-3">{report.name}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {report.formats.map((format) => (
                        <Badge key={format} variant="outline" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={onGenerateReport}
                      disabled={report.premium && !canExport}
                    >
                      Générer
                    </Button>
                  </div>
                  {report.lastGenerated && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Dernière génération : {report.lastGenerated}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recent Reports Tab */}
        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentReports.map((report) => {
                  const config = statusConfig[report.status];
                  const StatusIcon = config.icon;
                  
                  return (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">{report.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${config.color} ${report.status === 'generating' ? 'animate-spin' : ''}`} />
                          <span className={`text-sm ${config.color}`}>{config.label}</span>
                        </div>
                        <Badge variant="outline">{report.format}</Badge>
                        {report.status === "ready" && (
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Gating */}
      {!canExport && (
        <Card className="border-dashed">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <Download className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Formats avancés (XLSX, détaillé)</p>
                  <p className="text-sm text-muted-foreground">
                    Disponibles avec les plans Argent et Or
                  </p>
                </div>
              </div>
              <Button variant="outline">Voir les plans</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
