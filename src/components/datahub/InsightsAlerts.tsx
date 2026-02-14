import { useState } from "react";
import { 
  ArrowLeft, 
  AlertTriangle, 
  TrendingDown,
  Clock,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Bell,
  Filter,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InsightsAlertsProps {
  onBack: () => void;
}

type AlertType = "urgent" | "warning" | "info" | "success";
type AlertCategory = "marketplace" | "ao" | "kyc" | "formation" | "financement" | "general";

interface Alert {
  id: string;
  type: AlertType;
  category: AlertCategory;
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  date: string;
  isRead: boolean;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "urgent",
    category: "kyc",
    title: "Attestation CNPS expire dans 12 jours",
    description: "Renouvelez votre attestation pour maintenir votre conformité.",
    actionLabel: "Renouveler",
    actionPath: "/kyc",
    date: "Aujourd'hui",
    isRead: false,
  },
  {
    id: "2",
    type: "warning",
    category: "ao",
    title: "AO MINADER clôture dans 48h",
    description: "Finalisez votre soumission avant la date limite.",
    actionLabel: "Voir l'AO",
    actionPath: "/appels-offres",
    date: "Aujourd'hui",
    isRead: false,
  },
  {
    id: "3",
    type: "warning",
    category: "marketplace",
    title: "3 produits en rupture de stock",
    description: "Cacao Premium, Café Robusta 500g, Noix de cajou Bio",
    actionLabel: "Gérer stock",
    actionPath: "/marketplace",
    date: "Hier",
    isRead: false,
  },
  {
    id: "4",
    type: "info",
    category: "financement",
    title: "Dossier BNI : documents complémentaires demandés",
    description: "L'organisme a demandé des pièces supplémentaires.",
    actionLabel: "Compléter",
    actionPath: "/financement",
    date: "Il y a 2 jours",
    isRead: true,
  },
  {
    id: "5",
    type: "success",
    category: "ao",
    title: "AO Port Autonome gagné !",
    description: "Félicitations, votre soumission a été retenue.",
    actionLabel: "Voir détails",
    actionPath: "/appels-offres",
    date: "Il y a 3 jours",
    isRead: true,
  },
  {
    id: "6",
    type: "info",
    category: "formation",
    title: "Nouvelle formation disponible",
    description: "Export vers l'UE : normes et certifications",
    actionLabel: "Découvrir",
    actionPath: "/formation",
    date: "Il y a 5 jours",
    isRead: true,
  },
];

const recommendations = [
  {
    id: "1",
    icon: Lightbulb,
    title: "Activez le label 'Made in CI'",
    description: "Augmentez votre visibilité de 35% en moyenne sur la Marketplace.",
    impact: "Haute",
    actionLabel: "Activer",
  },
  {
    id: "2",
    icon: Lightbulb,
    title: "Complétez vos capacités de production",
    description: "Soyez visible sur plus d'appels d'offres correspondant à vos capacités.",
    impact: "Haute",
    actionLabel: "Compléter",
  },
  {
    id: "3",
    icon: Lightbulb,
    title: "Inscrivez votre équipe à la formation Export",
    description: "Renforcez les compétences export de votre équipe commerciale.",
    impact: "Moyenne",
    actionLabel: "Voir formation",
  },
  {
    id: "4",
    icon: Lightbulb,
    title: "Préparez un dossier de financement",
    description: "3 opportunités de financement correspondent à votre profil.",
    impact: "Moyenne",
    actionLabel: "Explorer",
  },
];

const alertTypeConfig: Record<AlertType, { icon: React.ElementType; color: string; bgColor: string }> = {
  urgent: { icon: XCircle, color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-950/30" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-950/30" },
  info: { icon: Clock, color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-950/30" },
  success: { icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-950/30" },
};

const categoryLabels: Record<AlertCategory, string> = {
  marketplace: "Marketplace",
  ao: "Appels d'offres",
  kyc: "KYC",
  formation: "Formation",
  financement: "Financement",
  general: "Général",
};

export function InsightsAlerts({ onBack }: InsightsAlertsProps) {
  const [activeTab, setActiveTab] = useState("alerts");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredAlerts = alerts.filter(
    (alert) => categoryFilter === "all" || alert.category === categoryFilter
  );

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Insights & Alertes</h1>
            <p className="text-muted-foreground">Notifications et recommandations personnalisées</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount} non lues</Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              Alertes
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommandations
            </TabsTrigger>
          </TabsList>

          {activeTab === "alerts" && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="ao">Appels d'offres</SelectItem>
                <SelectItem value="kyc">KYC</SelectItem>
                <SelectItem value="formation">Formation</SelectItem>
                <SelectItem value="financement">Financement</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-6">
          <Card>
            <CardContent className="p-0 divide-y">
              {filteredAlerts.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune alerte pour ce filtre</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const config = alertTypeConfig[alert.type];
                  const AlertIcon = config.icon;

                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-4 p-4 ${!alert.isRead ? "bg-muted/30" : ""}`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bgColor}`}>
                        <AlertIcon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium ${!alert.isRead ? "" : "text-muted-foreground"}`}>
                            {alert.title}
                          </p>
                          {!alert.isRead && (
                            <Badge variant="secondary" className="text-xs">Nouveau</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline">{categoryLabels[alert.category]}</Badge>
                          <span className="text-xs text-muted-foreground">{alert.date}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {alert.actionLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <rec.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant={rec.impact === "Haute" ? "default" : "secondary"}>
                      Impact {rec.impact}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{rec.title}</CardTitle>
                  <CardDescription>{rec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    {rec.actionLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Résumé de la semaine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <TrendingDown className="h-5 w-5 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">2</p>
              <p className="text-xs text-muted-foreground">Alertes urgentes</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">À surveiller</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">Bonnes nouvelles</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Lightbulb className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-muted-foreground">Recommandations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
