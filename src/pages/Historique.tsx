import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  History as HistoryIcon, 
  Filter,
  Search,
  Calendar,
  ShoppingCart,
  FileCheck,
  GraduationCap,
  Wallet,
  Shield,
  Building2,
  Download,
  Eye,
  ChevronRight,
  Clock
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ActivityType = "marketplace" | "ao" | "formation" | "financement" | "kyc" | "affiliation" | "profile";

interface Activity {
  id: string;
  type: ActivityType;
  action: string;
  description: string;
  date: string;
  time: string;
  status?: string;
  amount?: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "marketplace",
    action: "Commande reçue",
    description: "Nouvelle commande #CMD-2024-156 de Société ABC",
    date: "22 déc. 2024",
    time: "14:32",
    status: "confirmed",
    amount: "450,000 FCFA"
  },
  {
    id: "2",
    type: "ao",
    action: "Soumission envoyée",
    description: "AO-2024-095 - SOTRA - Fourniture équipements",
    date: "22 déc. 2024",
    time: "11:45",
    status: "pending"
  },
  {
    id: "3",
    type: "formation",
    action: "Module complété",
    description: "Formation Export - Module 3: Normes UE",
    date: "21 déc. 2024",
    time: "16:20"
  },
  {
    id: "4",
    type: "marketplace",
    action: "Produit publié",
    description: "Café Robusta Bio 500g - Ajouté au catalogue",
    date: "21 déc. 2024",
    time: "10:15"
  },
  {
    id: "5",
    type: "financement",
    action: "Dossier soumis",
    description: "Demande BNI - Ligne de trésorerie 25M FCFA",
    date: "20 déc. 2024",
    time: "09:30",
    status: "review"
  },
  {
    id: "6",
    type: "kyc",
    action: "Document validé",
    description: "Attestation fiscale 2024 - Vérification OK",
    date: "19 déc. 2024",
    time: "15:45",
    status: "approved"
  },
  {
    id: "7",
    type: "ao",
    action: "AO gagné",
    description: "AO-2024-089 - MINADER - 15M FCFA",
    date: "18 déc. 2024",
    time: "14:00",
    status: "won",
    amount: "15,000,000 FCFA"
  },
  {
    id: "8",
    type: "affiliation",
    action: "Affiliation approuvée",
    description: "FIPME Agroalimentaire - Membre actif",
    date: "15 déc. 2024",
    time: "11:30",
    status: "approved"
  },
  {
    id: "9",
    type: "profile",
    action: "Profil mis à jour",
    description: "Informations entreprise modifiées",
    date: "14 déc. 2024",
    time: "09:00"
  },
  {
    id: "10",
    type: "marketplace",
    action: "Commande expédiée",
    description: "Commande #CMD-2024-148 - Livraison en cours",
    date: "13 déc. 2024",
    time: "16:45",
    status: "shipped"
  },
];

const typeConfig: Record<ActivityType, { icon: React.ElementType; label: string; color: string }> = {
  marketplace: { icon: ShoppingCart, label: "Marketplace", color: "text-green-500" },
  ao: { icon: FileCheck, label: "Appels d'offres", color: "text-blue-500" },
  formation: { icon: GraduationCap, label: "Formation", color: "text-purple-500" },
  financement: { icon: Wallet, label: "Financement", color: "text-orange-500" },
  kyc: { icon: Shield, label: "KYC", color: "text-red-500" },
  affiliation: { icon: Building2, label: "Affiliation", color: "text-cyan-500" },
  profile: { icon: Building2, label: "Profil", color: "text-gray-500" },
};

export default function Historique() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("30j");

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = 
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || activity.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Stats
  const stats = {
    total: activities.length,
    marketplace: activities.filter(a => a.type === "marketplace").length,
    ao: activities.filter(a => a.type === "ao").length,
    formation: activities.filter(a => a.type === "formation").length,
  };

  return (
    <>
      <Helmet>
        <title>Historique - CPU-PME</title>
        <meta name="description" content="Historique de toutes vos activités sur la plateforme CPU-PME." />
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Historique</h1>
              <p className="text-muted-foreground">
                Retrouvez toutes vos activités sur la plateforme
              </p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <HistoryIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Activités totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/30">
                    <ShoppingCart className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.marketplace}</p>
                    <p className="text-xs text-muted-foreground">Marketplace</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/30">
                    <FileCheck className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.ao}</p>
                    <p className="text-xs text-muted-foreground">Appels d'offres</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/30">
                    <GraduationCap className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.formation}</p>
                    <p className="text-xs text-muted-foreground">Formation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une activité..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="ao">Appels d'offres</SelectItem>
                <SelectItem value="formation">Formation</SelectItem>
                <SelectItem value="financement">Financement</SelectItem>
                <SelectItem value="kyc">KYC</SelectItem>
                <SelectItem value="affiliation">Affiliation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7j">7 derniers jours</SelectItem>
                <SelectItem value="30j">30 derniers jours</SelectItem>
                <SelectItem value="90j">3 derniers mois</SelectItem>
                <SelectItem value="12m">12 derniers mois</SelectItem>
                <SelectItem value="all">Tout l'historique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activités récentes</CardTitle>
              <CardDescription>{filteredActivities.length} activités trouvées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredActivities.map((activity, index) => {
                  const config = typeConfig[activity.type];
                  const TypeIcon = config.icon;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="relative">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted`}>
                          <TypeIcon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        {index < filteredActivities.length - 1 && (
                          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{activity.action}</p>
                          <Badge variant="outline" className="text-xs">{config.label}</Badge>
                          {activity.status && (
                            <Badge 
                              variant={
                                activity.status === "approved" || activity.status === "won" ? "default" :
                                activity.status === "pending" || activity.status === "review" ? "secondary" :
                                "outline"
                              }
                              className="text-xs"
                            >
                              {activity.status === "approved" && "Approuvé"}
                              {activity.status === "won" && "Gagné"}
                              {activity.status === "pending" && "En attente"}
                              {activity.status === "review" && "En révision"}
                              {activity.status === "confirmed" && "Confirmé"}
                              {activity.status === "shipped" && "Expédié"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{activity.date} à {activity.time}</span>
                          </div>
                          {activity.amount && (
                            <Badge variant="secondary">{activity.amount}</Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}

                {filteredActivities.length === 0 && (
                  <div className="py-12 text-center">
                    <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune activité trouvée pour ces critères</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}
